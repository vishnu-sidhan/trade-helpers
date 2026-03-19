export interface CalculatorInputs {
  strike: number;
  entry: number;
  spotEntry: number;
  spotTarget: number;
  lotSize: number;
  optType: 'CE' | 'PE';
  ivScenario: 'conservative' | 'base' | 'optimistic';
  tradeType: 'intraday' | 'overnight';
  dte: number;   // Days to Expiry — e.g. 1 for expiry day, 7 for weekly, 30 for monthly
  iv: number;    // Implied Volatility in percent — e.g. 15 means 15%
}

export interface ScenarioResult {
  low: number;
  high: number;
  pnl: number;
}

export interface CalculatorResult {
  intrinsic: number;
  spotMove: number;
  avgDelta: number;
  statusLabel: string;
  conservative: ScenarioResult;
  base: ScenarioResult;
  optimistic: ScenarioResult;
}

// --- Decay Timeline Types ---
export interface DecayTimePoint {
  label: string;        // e.g. "Now", "30 min", "1 hr", "EOD"
  minutesFromNow: number;
  conservative: number; // target premium after decay
  base: number;
  optimistic: number;
  thetaLoss: number;    // cumulative theta loss from entry time
}

export interface DecayTimelineResult {
  points: DecayTimePoint[];
  thetaPerMinute: number;
  totalTradingMinutes: number;
}

/**
 * calculateDailyTheta
 * -------------------
 * Computes the estimated daily theta (time decay in ₹ per unit per day)
 * using the Black-Scholes at-the-money approximation formula:
 *
 *   Θ/day ≈ (S × σ × N'(d1)) / (2 × √T)
 *
 * Simplified for near-ATM options where N'(d1) ≈ 0.4:
 *   Θ/day ≈ (spotEntry × (iv/100) × 0.4) / (2 × √(dte/365))
 *
 * This is instrument-agnostic and works for Nifty (~23000), Sensex (~76500),
 * BankNifty (~50000), or any other index because it uses spotEntry as the base.
 *
 * @param spotEntry  - Current spot price of the underlying (e.g. 23125 for Nifty)
 * @param iv         - Implied volatility in percent (e.g. 15 for 15%)
 * @param dte        - Days to expiry (use 0.5 for same-day expiry afternoon)
 * @returns          - Theta per unit per day (positive number, represents decay)
 */
export function calculateDailyTheta(spotEntry: number, iv: number, dte: number): number {
  const ivDecimal = iv / 100;
  // Clamp DTE to a minimum of 0.25 days to avoid division by zero on expiry day
  const safeDte = Math.max(dte, 0.25);
  const T = safeDte / 365;                          // time in years
  const theta = (spotEntry * ivDecimal * 0.4) / (2 * Math.sqrt(T));
  return parseFloat(theta.toFixed(4));
}

export function calculateExitStats(inputs: CalculatorInputs): CalculatorResult {
  const { strike, entry, spotEntry, spotTarget, lotSize, optType, tradeType, dte, iv } = inputs;

  // Intrinsic value at target
  let intrinsic = 0;
  if (optType === 'CE') intrinsic = Math.max(0, spotTarget - strike);
  else intrinsic = Math.max(0, strike - spotTarget);

  // Spot move
  const spotMove = Math.abs(spotTarget - spotEntry);

  // Delta at entry
  const diffEntry = optType === 'CE' ? spotEntry - strike : strike - spotEntry;
  let deltaEntry = 0.50;
  if (diffEntry < -100) deltaEntry = 0.30;
  else if (diffEntry < -50) deltaEntry = 0.38;
  else if (diffEntry < 0) deltaEntry = 0.44;
  else if (diffEntry < 50) deltaEntry = 0.56;
  else if (diffEntry < 100) deltaEntry = 0.62;
  else deltaEntry = 0.70;

  // Delta at target
  const diffTarget = optType === 'CE' ? spotTarget - strike : strike - spotTarget;
  let deltaTarget = 0.70;
  if (diffTarget < -100) deltaTarget = 0.30;
  else if (diffTarget < 0) deltaTarget = 0.45;
  else if (diffTarget < 100) deltaTarget = 0.65;
  else if (diffTarget < 200) deltaTarget = 0.75;
  else deltaTarget = 0.85;

  const avgDelta = (deltaEntry + deltaTarget) / 2;
  const premiumGain = spotMove * avgDelta;

  // Theta decay — dynamic, using Black-Scholes ATM approximation
  // thetaFull = daily theta × fraction of day traded
  // Intraday: theta for ~0.5 trading session equivalent
  // Overnight: theta for ~1.5 days (accounts for overnight time decay)
  const dailyTheta = calculateDailyTheta(spotEntry, iv, dte);
  const sessionFraction = tradeType === 'intraday' ? 0.5 : 1.5;
  const theta = dailyTheta * sessionFraction;

  const calculateScenario = (ivModifier: number, thetaModifier: number = 1): ScenarioResult => {
    const exitBase = Math.max(intrinsic, entry + premiumGain - (theta * thetaModifier) + ivModifier);
    const low = Math.floor(exitBase - 8);
    const high = Math.ceil(exitBase + 7);
    const pnl = ((low + high) / 2 - entry) * lotSize;
    return { low, high, pnl };
  };

  const conservative = calculateScenario(-(entry * 0.10));
  const base = calculateScenario(0);
  const optimistic = calculateScenario(entry * 0.12, 0.5);

  const statusLabel = intrinsic > 0 ? `ITM by ${Math.abs(intrinsic).toFixed(0)} pts` : `OTM by ${Math.abs(spotTarget - strike).toFixed(0)} pts`;

  return {
    intrinsic,
    spotMove,
    avgDelta,
    statusLabel,
    conservative,
    base,
    optimistic
  };
}

/**
 * calculateDecayTimeline
 * ----------------------
 * Given the calculator inputs and the target prices from calculateExitStats,
 * this function returns how the target premium decays over the trading session
 * due to theta (time decay) if the spot does NOT move — i.e., it shows how
 * long the trader has before theta erodes the target exit price.
 *
 * Time slots are generated for a standard NSE intraday session (9:15 – 15:30).
 * For overnight trades the session extends to next-day open (approx 375 min).
 */
export function calculateDecayTimeline(
  inputs: CalculatorInputs,
  targetBase: number   // base-case target premium (result.base midpoint)
): DecayTimelineResult {
  const { entry, tradeType, spotEntry, iv, dte } = inputs;

  const totalTradingMinutes = tradeType === 'intraday' ? 375 : 750;

  // Use the same Black-Scholes theta as calculateExitStats for consistency
  const dailyTheta = calculateDailyTheta(spotEntry, iv, dte);
  const sessionFraction = tradeType === 'intraday' ? 0.5 : 1.5;
  const thetaFull = dailyTheta * sessionFraction;

  // Per-minute theta (used for display badge and decay interpolation)
  const thetaPerMinute = thetaFull / totalTradingMinutes;

  // Time slots
  const rawSlots: { label: string; minutes: number }[] = [
    { label: 'Entry (Now)', minutes: 0 },
    { label: '30 min', minutes: 30 },
    { label: '1 hr', minutes: 60 },
    { label: '1.5 hr', minutes: 90 },
    { label: '2 hr', minutes: 120 },
    { label: '2.5 hr', minutes: 150 },
    { label: '3 hr', minutes: 180 },
    { label: 'EOD / Exit', minutes: totalTradingMinutes },
  ];

  const points: DecayTimePoint[] = rawSlots.map(({ label, minutes }) => {
    // Non-linear (sqrt) cumulative theta — theta accelerates as expiry nears
    const thetaLoss = thetaFull * Math.sqrt(minutes / totalTradingMinutes);

    // The target premium is the base-case target MINUS whatever theta has eroded
    const baseDecayed   = Math.max(entry, parseFloat((targetBase - thetaLoss).toFixed(2)));
    const consDecayed   = Math.max(entry * 0.9, parseFloat((targetBase - thetaLoss - entry * 0.10).toFixed(2)));
    const optiDecayed   = Math.max(entry, parseFloat((targetBase - thetaLoss * 0.5 + entry * 0.12).toFixed(2)));

    return {
      label,
      minutesFromNow: minutes,
      base: baseDecayed,
      conservative: consDecayed,
      optimistic: optiDecayed,
      thetaLoss: parseFloat(thetaLoss.toFixed(2)),
    };
  });

  return { points, thetaPerMinute, totalTradingMinutes };
}
