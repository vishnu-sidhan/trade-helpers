import React, { useState } from 'react';
import type { CalculatorInputs } from '../lib/calculations';
import { calculateExitStats } from '../lib/calculations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { Save } from 'lucide-react';

export function OptionsCalculator() {
  const [inputs, setInputs] = useLocalStorage<CalculatorInputs>('tradeSettings', {
    strike: 23200,
    entry: 125,
    spotEntry: 23125,
    spotTarget: 23400,
    lotSize: 65,
    optType: 'CE',
    ivScenario: 'base',
    tradeType: 'intraday'
  });

  const [slInputs, setSlInputs] = useLocalStorage('slSettings', {
    type: 'percent',
    value: 30,
    lots: 1
  });

  const { addTrade } = useTradeHistory();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setInputs((prev: CalculatorInputs) => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value
    }));
  };

  const handleSlChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Update label defaults when type changes
    if (name === 'type') {
       let defaultVal = 30;
       if (value === 'points') defaultVal = 50;
       if (value === 'spot') defaultVal = inputs.spotEntry ? inputs.spotEntry - 100 : 23000;
       if (value === 'fixed') defaultVal = inputs.entry ? inputs.entry * 0.5 : 70;
       setSlInputs((prev: any) => ({ ...prev, type: value, value: defaultVal }));
       return;
    }
    const isNumber = e.target.type === 'number';
    setSlInputs((prev: any) => ({
      ...prev,
      [name]: isNumber ? parseFloat(value) || 0 : value
    }));
  };
  
  const getSlLabel = () => {
    switch (slInputs.type) {
        case 'percent': return 'SL % of Premium';
        case 'points': return 'SL Points Below Entry';
        case 'spot': return 'SL Spot Level';
        case 'fixed': return 'SL Exit Premium (₹)';
        default: return 'SL Value';
    }
  };

  const result = calculateExitStats(inputs);
  
  // Calculate Stop Loss derived metrics locally for now (can move to lib later)
  let slPremium = 0;
  if (slInputs.type === 'percent') { slPremium = inputs.entry * (1 - slInputs.value / 100); }
  else if (slInputs.type === 'points') { slPremium = inputs.entry - slInputs.value; }
  else if (slInputs.type === 'spot') { 
      const spotDiff = inputs.spotEntry - slInputs.value; 
      slPremium = Math.max(5, inputs.entry - spotDiff * 0.45); 
  }
  else if (slInputs.type === 'fixed') { slPremium = slInputs.value; }
  
  slPremium = Math.max(1, parseFloat(slPremium.toFixed(2)));
  const riskPerUnit = inputs.entry - slPremium;
  const riskPerLot = riskPerUnit * inputs.lotSize;
  const totalRisk = riskPerLot * slInputs.lots;
  // Calculate SL Nifty Level if not explicitly spot type
  const niftySLLevel = slInputs.type === 'spot' ? slInputs.value : Math.round(inputs.spotEntry - (riskPerUnit / 0.45));

  const handleSave = () => {
    addTrade({
      inputs,
      targetProfit: result.base.high,
      riskPerLot: riskPerUnit,
      slType: slInputs.type,
      slPremium
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const fmt = (v: number) => v.toLocaleString('en-IN', {maximumFractionDigits: 0});
  const pnlColor = (v: number) => v >= 0 ? 'text-emerald-400' : 'text-red-400';
  const pnlSign = (v: number) => v >= 0 ? '+' : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Target Exit Calculator</h2>
            <p className="text-gray-400 text-sm">Fine-tune your profit targets based on expected volatility and decay</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saveStatus === 'saved'}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-lg shadow-brand-500/20 font-medium transition-all focus:ring-2 focus:ring-brand-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-brand-400 border-b-2 active:border-b-1 active:translate-y-[1px]"
          >
            <Save className="w-4 h-4" />
            {saveStatus === 'saved' ? 'Saved to Journal' : 'Save Setup'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label-text">Strike Price</label>
            <input name="strike" type="number" value={inputs.strike} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Entry Premium</label>
            <input name="entry" type="number" value={inputs.entry} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Spot Entry</label>
            <input name="spotEntry" type="number" value={inputs.spotEntry} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Target Spot</label>
            <input name="spotTarget" type="number" value={inputs.spotTarget} onChange={handleChange} className="input-field" />
          </div>
          
          <div>
            <label className="label-text">Lot Size</label>
            <input name="lotSize" type="number" value={inputs.lotSize} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Option Type</label>
            <select name="optType" value={inputs.optType} onChange={handleChange} className="input-field">
              <option value="CE">CE (Call)</option>
              <option value="PE">PE (Put)</option>
            </select>
          </div>
          <div>
            <label className="label-text">IV Scenario</label>
            <select name="ivScenario" value={inputs.ivScenario} onChange={handleChange} className="input-field">
              <option value="conservative">Conservative (IV drops)</option>
              <option value="base">Base Case (IV neutral)</option>
              <option value="optimistic">Optimistic (IV expands)</option>
            </select>
          </div>
          <div>
            <label className="label-text">Trade Type</label>
            <select name="tradeType" value={inputs.tradeType} onChange={handleChange} className="input-field">
              <option value="intraday">Intraday</option>
              <option value="overnight">Overnight</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenarios */}
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/60 transition-colors">
          <div className="absolute top-0 right-0 p-2 opacity-10">📉</div>
          <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Conservative
          </h3>
          <div className="text-3xl font-bold text-white mb-1">₹{result.conservative.low} - ₹{result.conservative.high}</div>
          <div className={`font-mono text-sm ${pnlColor(result.conservative.pnl)}`}>{pnlSign(result.conservative.pnl)}₹{fmt(Math.abs(result.conservative.pnl))} P&L</div>
        </div>

        <div className="bg-brand-500/20 border border-brand-500/50 rounded-2xl p-6 relative overflow-hidden ring-1 ring-brand-500/20 shadow-[0_0_30px_rgba(124,58,237,0.15)] group hover:border-brand-400 transition-colors">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-2xl">✨</div>
          <h3 className="text-brand-300 font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Base Case
          </h3>
          <div className="text-4xl font-bold text-white mb-1 drop-shadow-lg">₹{result.base.low} - ₹{result.base.high}</div>
          <div className={`font-mono text-base ${pnlColor(result.base.pnl)} font-medium`}>{pnlSign(result.base.pnl)}₹{fmt(Math.abs(result.base.pnl))} P&L</div>
        </div>

        <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/60 transition-colors">
          <div className="absolute top-0 right-0 p-2 opacity-10">📈</div>
          <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
             Optimistic
          </h3>
          <div className="text-3xl font-bold text-white mb-1">₹{result.optimistic.low} - ₹{result.optimistic.high}</div>
          <div className={`font-mono text-sm ${pnlColor(result.optimistic.pnl)}`}>{pnlSign(result.optimistic.pnl)}₹{fmt(Math.abs(result.optimistic.pnl))} P&L</div>
        </div>
      </div>

      <div className="glass-panel border-red-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-700"></div>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-rose-200">Stop Loss Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label-text">SL Type</label>
                        <select name="type" value={slInputs.type} onChange={handleSlChange} className="input-field border-red-500/20 focus:ring-red-500">
                            <option value="percent">% of Premium</option>
                            <option value="points">Points Based</option>
                            <option value="spot">Spot Level Based</option>
                            <option value="fixed">Fixed Premium</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-text">{getSlLabel()}</label>
                        <input name="value" type="number" value={slInputs.value} onChange={handleSlChange} className="input-field border-red-500/20 focus:ring-red-500" />
                    </div>
                    <div>
                        <label className="label-text">Number of Lots</label>
                        <input name="lots" type="number" value={slInputs.lots} onChange={handleSlChange} className="input-field border-red-500/20 focus:ring-red-500" />
                    </div>
                </div>
            </div>
            <div className="w-px bg-white/10 hidden md:block"></div>
            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">SL Premium Target</p>
                    <p className="text-2xl font-bold text-rose-400">₹{slPremium}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Est. Nifty Level</p>
                    <p className="text-2xl font-bold text-amber-300">{niftySLLevel}</p>
                </div>
                <div className="col-span-2 bg-red-950/40 rounded-xl p-4 border border-red-500/20">
                     <p className="text-xs text-rose-300 uppercase tracking-wide mb-1">Total Risk ({slInputs.lots} Lots)</p>
                     <p className="text-3xl font-bold text-red-500">-₹{fmt(totalRisk)}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
