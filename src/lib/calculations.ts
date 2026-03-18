export interface CalculatorInputs {
  strike: number;
  entry: number;
  spotEntry: number;
  spotTarget: number;
  lotSize: number;
  optType: 'CE' | 'PE';
  ivScenario: 'conservative' | 'base' | 'optimistic';
  tradeType: 'intraday' | 'overnight';
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

export function calculateExitStats(inputs: CalculatorInputs): CalculatorResult {
  const { strike, entry, spotEntry, spotTarget, lotSize, optType, tradeType } = inputs;

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

  // Theta decay
  const theta = tradeType === 'intraday' ? (entry * 0.04) : (entry * 0.08);

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
  const { entry, tradeType } = inputs;

  // Total trading minutes in the session
  const totalTradingMinutes = tradeType === 'intraday' ? 375 : 750; // ~375 min NSE intraday, 750 for overnight

  // Theta (full session) from the existing model
  const thetaFull = tradeType === 'intraday' ? entry * 0.04 : entry * 0.08;

  // Per-minute theta rate (non-linear: accelerates toward expiry — square-root time model)
  // We model: cumulativeTheta(t) = thetaFull * sqrt(t / totalTradingMinutes)
  const thetaPerMinute = thetaFull / totalTradingMinutes; // linear approximation for display

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
