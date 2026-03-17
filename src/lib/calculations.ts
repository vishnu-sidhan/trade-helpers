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
