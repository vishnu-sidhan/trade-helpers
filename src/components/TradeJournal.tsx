import { useTradeHistory } from '../hooks/useTradeHistory';
import { Trash2 } from 'lucide-react';

export function TradeJournal() {
  const { trades, removeTrade, clearJournal } = useTradeHistory();

  const fmt = (v: number) => Math.round(v).toLocaleString('en-IN');
  const dFmt = (d: string) => new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(d));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Trade Journal</h2>
            <p className="text-gray-400 text-sm">Review your historically calculated setups and risk profiles.</p>
          </div>
          {trades.length > 0 && (
              <button onClick={clearJournal} className="text-sm px-4 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                Clear All
              </button>
          )}
        </div>

        {trades.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-12 rounded-xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-50">📓</span>
              </div>
              <h3 className="text-xl font-medium text-white">No trades saved yet</h3>
              <p className="text-gray-500 text-sm mt-2">Use the "Save Setup" button in the calculator to record trades here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trades.map((trade) => {
              const rrRatio = (trade.targetProfit - trade.inputs.entry) / trade.riskPerLot;
              
              return (
              <div key={trade.id} className="bg-black/20 border border-white/10 rounded-xl p-5 relative group">
                <button 
                  onClick={() => removeTrade(trade.id)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${trade.inputs.optType === 'CE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {trade.inputs.strike} {trade.inputs.optType}
                  </span>
                  <span className="text-xs text-gray-400">{dFmt(trade.date)}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Base Entry</p>
                    <p className="text-lg font-bold text-white">₹{trade.inputs.entry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Target Range</p>
                    <p className="text-lg font-bold text-brand-400">₹{fmt(trade.targetProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">SL Protocol ({trade.slType})</p>
                    <p className="text-lg font-bold text-rose-400">₹{trade.slPremium}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Risk/Reward</p>
                    <p className={`text-lg font-bold ${rrRatio >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      1 : {rrRatio.toFixed(1)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center mt-2 border border-white/5">
                  <span className="text-xs text-gray-400">Spot Details: Entry {fmt(trade.inputs.spotEntry)} → Target {fmt(trade.inputs.spotTarget)}</span>
                  <span className="text-xs font-medium text-gray-300">{trade.inputs.lotSize} Qty</span>
                </div>

              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
