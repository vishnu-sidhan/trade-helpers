function calculate() {
  const strike = parseFloat(document.getElementById('strike').value);
  const entry = parseFloat(document.getElementById('entry').value);
  const spotEntry = parseFloat(document.getElementById('spotEntry').value);
  const spotTarget = parseFloat(document.getElementById('spotTarget').value);
  const lotSize = parseFloat(document.getElementById('lotSize').value);
  const optType = document.getElementById('optionType').value;
  const ivScenario = document.getElementById('ivScenario').value;
  const tradeType = document.getElementById('tradeType').value;

  // Intrinsic value at target
  let intrinsic = 0;
  if (optType === 'CE') intrinsic = Math.max(0, spotTarget - strike);
  else intrinsic = Math.max(0, strike - spotTarget);

  // Spot move
  const spotMove = Math.abs(spotTarget - spotEntry);

  // Delta at entry (OTM=0.35, ATM=0.50, ITM=0.65)
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

  // IV adjustment
  let ivAdj = 0;
  if (ivScenario === 'conservative') ivAdj = -(entry * 0.10);
  else if (ivScenario === 'optimistic') ivAdj = (entry * 0.12);

  // Base exit
  const baseExit = entry + premiumGain - theta + ivAdj;
  const finalExit = Math.max(intrinsic, baseExit);

  // 3 scenarios
  const conExit = Math.max(intrinsic, entry + premiumGain - theta - (entry * 0.10));
  const baseEx = Math.max(intrinsic, entry + premiumGain - theta);
  const optExit = Math.max(intrinsic, entry + premiumGain - (theta * 0.5) + (entry * 0.12));

  const conLow = Math.floor(conExit - 8);
  const conHigh = Math.ceil(conExit + 7);
  const baseLow = Math.floor(baseEx - 8);
  const baseHigh = Math.ceil(baseEx + 7);
  const optLow = Math.floor(optExit - 8);
  const optHigh = Math.ceil(optExit + 7);

  const pnlCon = ((conLow + conHigh) / 2 - entry) * lotSize;
  const pnlBase = ((baseLow + baseHigh) / 2 - entry) * lotSize;
  const pnlOpt = ((optLow + optHigh) / 2 - entry) * lotSize;

  const pnlColor = (v) => v >= 0 ? 'profit' : 'loss';
  const pnlSign = (v) => v >= 0 ? '+' : '';
  const fmt = (v) => v.toLocaleString('en-IN', {maximumFractionDigits: 0});

  const statusLabel = intrinsic > 0 ? `ITM by ${intrinsic} pts` : `OTM by ${Math.abs(spotTarget - strike)} pts`;

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').innerHTML = `
    <div class="intrinsic-bar">
      <p>Intrinsic Value at Target (${spotTarget}): <span>&#8377;${intrinsic}</span> &nbsp;|&nbsp; Spot Move: <span>+${spotMove} pts</span> &nbsp;|&nbsp; Avg Delta: <span>${avgDelta.toFixed(2)}</span> &nbsp;|&nbsp; Status: <span>${statusLabel}</span></p>
    </div>
    <div class="scenario con" style="margin-top:16px">
      <h3>&#128308; Scenario 1 — Conservative <span class="tag con">IV Drops</span></h3>
      <div class="scenario-grid">
        <div class="metric"><div class="val">&#8377;${conLow}–${conHigh}</div><div class="lbl">Exit Price Range</div></div>
        <div class="metric"><div class="val ${pnlColor(conLow - entry)}">&#8377;${fmt(Math.abs(conLow - entry))}–${fmt(Math.abs(conHigh - entry))}</div><div class="lbl">Profit Per Unit</div></div>
        <div class="metric"><div class="val ${pnlColor(pnlCon)}">${pnlSign(pnlCon)}&#8377;${fmt(Math.abs(pnlCon))}</div><div class="lbl">P&amp;L Per Lot (${lotSize} qty)</div></div>
      </div>
    </div>
    <div class="scenario base">
      <h3>&#128993; Scenario 2 — Base Case <span class="tag base">IV Neutral</span></h3>
      <div class="scenario-grid">
        <div class="metric"><div class="val">&#8377;${baseLow}–${baseHigh}</div><div class="lbl">Exit Price Range</div></div>
        <div class="metric"><div class="val ${pnlColor(baseLow - entry)}">&#8377;${fmt(Math.abs(baseLow - entry))}–${fmt(Math.abs(baseHigh - entry))}</div><div class="lbl">Profit Per Unit</div></div>
        <div class="metric"><div class="val ${pnlColor(pnlBase)}">${pnlSign(pnlBase)}&#8377;${fmt(Math.abs(pnlBase))}</div><div class="lbl">P&amp;L Per Lot (${lotSize} qty)</div></div>
      </div>
    </div>
    <div class="scenario opt">
      <h3>&#128994; Scenario 3 — Optimistic <span class="tag opt">IV Expands</span></h3>
      <div class="scenario-grid">
        <div class="metric"><div class="val">&#8377;${optLow}–${optHigh}</div><div class="lbl">Exit Price Range</div></div>
        <div class="metric"><div class="val ${pnlColor(optLow - entry)}">&#8377;${fmt(Math.abs(optLow - entry))}–${fmt(Math.abs(optHigh - entry))}</div><div class="lbl">Profit Per Unit</div></div>
        <div class="metric"><div class="val ${pnlColor(pnlOpt)}">${pnlSign(pnlOpt)}&#8377;${fmt(Math.abs(pnlOpt))}</div><div class="lbl">P&amp;L Per Lot (${lotSize} qty)</div></div>
      </div>
    </div>
    <div class="summary">
      <h2>RECOMMENDED EXIT RANGE (BASE CASE)</h2>
      <div class="best">&#8377;${baseLow} – &#8377;${baseHigh}</div>
      <p style="color:#ccc;font-size:12px;margin-top:8px">Entry: &#8377;${entry} &nbsp;|&nbsp; Target Spot: ${spotTarget} &nbsp;|&nbsp; Lot: ${lotSize} qty &nbsp;|&nbsp; ${tradeType === 'intraday' ? 'Intraday' : 'Overnight'}</p>
    </div>
  `;
}

function toggleSLInputs() {
  const type = document.getElementById('slType').value;
  const label = document.getElementById('slValueLabel');
  const input = document.getElementById('slValue');
  if (type === 'percent') { label.textContent = 'SL % of Premium'; input.value = 30; input.placeholder = 'e.g. 30'; }
  else if (type === 'points') { label.textContent = 'SL Points Below Entry'; input.value = 50; input.placeholder = 'e.g. 50'; }
  else if (type === 'spot') { label.textContent = 'SL Nifty Spot Level'; input.value = 23000; input.placeholder = 'e.g. 23000'; }
  else if (type === 'fixed') { label.textContent = 'SL Exit Premium (\u20b9)'; input.value = 70; input.placeholder = 'e.g. 70'; }
}

function calculateSL() {
  const entry = parseFloat(document.getElementById('entry').value) || 125;
  const strike = parseFloat(document.getElementById('strike').value) || 23200;
  const spotEntry = parseFloat(document.getElementById('spotEntry').value) || 23125;
  const spotTarget = parseFloat(document.getElementById('spotTarget').value) || 23400;
  const lotSize = parseFloat(document.getElementById('lotSize').value) || 65;
  const slType = document.getElementById('slType').value;
  const slValue = parseFloat(document.getElementById('slValue').value);
  const slLots = parseFloat(document.getElementById('slLots').value) || 1;
    const rrRatio = '2';
  const fmt = (v) => v.toLocaleString('en-IN', {maximumFractionDigits: 0});

  // Calculate SL premium
  let slPremium = 0;
  let slSpotLevel = 0;
  if (slType === 'percent') { slPremium = entry * (1 - slValue / 100); }
  else if (slType === 'points') { slPremium = entry - slValue; }
  else if (slType === 'spot') { slSpotLevel = slValue; const spotDiff = spotEntry - slValue; slPremium = Math.max(5, entry - spotDiff * 0.45); }
  else if (slType === 'fixed') { slPremium = slValue; }
  slPremium = Math.max(1, parseFloat(slPremium.toFixed(2)));

  // Risk per unit and per lot
  const riskPerUnit = entry - slPremium;
  const riskPerLot = riskPerUnit * lotSize;
  const totalRisk = riskPerLot * slLots;

  // Target premium based on RR
  const rr = rrRatio === 'custom' ? 2 : parseFloat(rrRatio);
  const targetPremiumRR = entry + (riskPerUnit * rr);

  // Expected target from exit calculator (base case estimate)
  const spotMove = Math.abs(spotTarget - spotEntry);
  const avgDelta = 0.55;
  const expectedTarget = entry + (spotMove * avgDelta) - (entry * 0.04);

  // Nifty SL level (reverse calculate)
  const niftySLLevel = slType === 'spot' ? slValue : Math.round(spotEntry - (riskPerUnit / 0.45));

  // Reward scenarios
  const rewardPerLot = (targetPremiumRR - entry) * lotSize * slLots;

  // Trade quality
  const rrActual = (expectedTarget - entry) / riskPerUnit;
  let adviceClass = 'warn', adviceText = '';
  if (rrActual >= 2.5) { adviceClass = 'good'; adviceText = '\u2705 Excellent trade! RR above 1:2.5 — High probability setup. Proceed with confidence.'; }
  else if (rrActual >= 1.5) { adviceClass = 'warn'; adviceText = '\u26a0\ufe0f Decent trade. RR between 1:1.5 and 1:2.5. Consider tightening SL or adjusting target.'; }
  else { adviceClass = 'bad'; adviceText = '\u274c Poor RR below 1:1.5. Risk is too high relative to reward. Avoid or reduce lot size.'; }

  document.getElementById('slResult').style.display = 'block';
  document.getElementById('slResult').innerHTML = `
    <div class="sl-card">
      <h3>&#128683; Stop Loss Details</h3>
      <div class="sl-grid">
        <div class="sl-metric"><div class="val danger">&#8377;${slPremium}</div><div class="lbl">SL Premium</div></div>
        <div class="sl-metric"><div class="val warn">${niftySLLevel}</div><div class="lbl">Nifty SL Level</div></div>
        <div class="sl-metric"><div class="val danger">&#8377;${riskPerUnit.toFixed(1)}</div><div class="lbl">Risk Per Unit</div></div>
        <div class="sl-metric"><div class="val danger">-&#8377;${fmt(totalRisk)}</div><div class="lbl">Max Loss (${slLots} lot)</div></div>
      </div>
    </div>
    
    
  `;
}