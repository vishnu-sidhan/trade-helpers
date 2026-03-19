import type { DecayTimelineResult } from '../lib/calculations';

interface Props {
  timeline: DecayTimelineResult;
  entry: number;
  targetBase: number;  // base-case target premium at time of calculation
}

export function DecayTimeline({ timeline, entry, targetBase }: Props) {
  const { points, thetaPerMinute } = timeline;

  const fmt = (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  // Width of each bar relative to targetBase (max is 100%)
  const barPct = (val: number) => Math.min(100, Math.max(0, (val / (targetBase * 1.15)) * 100));

  // Color coding based on how close to entry (danger) vs target (safe)
  const getBarColor = (val: number) => {
    const ratio = (val - entry) / (targetBase - entry);
    if (ratio >= 0.85) return 'bg-emerald-500';
    if (ratio >= 0.60) return 'bg-brand-500';
    if (ratio >= 0.35) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const getPremiumColor = (val: number) => {
    const ratio = (val - entry) / (targetBase - entry);
    if (ratio >= 0.85) return 'text-emerald-400';
    if (ratio >= 0.60) return 'text-brand-300';
    if (ratio >= 0.35) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Target Price Decay Timeline
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            How your target exit premium erodes over time if spot stays flat (theta decay)
          </p>
        </div>
        <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Theta / min</p>
          <p className="text-lg font-bold text-amber-300">-₹{(thetaPerMinute).toFixed(4)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Near target (&gt;85%)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500"></span> Good (60–85%)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Fading (35–60%)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> At risk (&lt;35%)</span>
      </div>

      {/* Timeline rows */}
      <div className="space-y-3">
        {points.map((pt, i) => (
          <div key={i} className="group">
            {/* Row header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-300 w-24 shrink-0">{pt.label}</span>
                <span className="text-xs text-rose-400 font-mono">
                  {pt.thetaLoss > 0 ? `-₹${fmt(pt.thetaLoss)} θ` : 'Entry'}
                </span>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-red-400" title="Conservative">{fmt(pt.conservative)}</span>
                <span className={`font-semibold ${getPremiumColor(pt.base)}`} title="Base">{fmt(pt.base)}</span>
                <span className="text-emerald-400" title="Optimistic">{fmt(pt.optimistic)}</span>
              </div>
            </div>

            {/* Bar track */}
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              {/* Entry marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-white/30"
                style={{ left: `${barPct(entry)}%` }}
              />
              {/* Conservative bar */}
              <div
                className="absolute top-0.5 bottom-0.5 rounded-full opacity-40 bg-red-400"
                style={{ width: `${barPct(pt.conservative)}%` }}
              />
              {/* Base bar */}
              <div
                className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${getBarColor(pt.base)}`}
                style={{ width: `${barPct(pt.base)}%` }}
              />
              {/* Optimistic bar */}
              <div
                className="absolute top-0.5 bottom-0.5 rounded-full opacity-40 bg-emerald-400"
                style={{ width: `${barPct(pt.optimistic)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reference line labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
        <span>Entry ₹{entry}</span>
        <span>Target ₹{fmt(targetBase)}</span>
      </div>

      {/* Summary table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Time</th>
              <th className="text-right py-2 px-3 text-red-400 font-medium">Conservative</th>
              <th className="text-right py-2 px-3 text-brand-300 font-medium">Base</th>
              <th className="text-right py-2 px-3 text-emerald-400 font-medium">Optimistic</th>
              <th className="text-right py-2 pl-3 text-rose-400 font-medium">θ Loss</th>
            </tr>
          </thead>
          <tbody>
            {points.map((pt, i) => (
              <tr
                key={i}
                className={`border-b border-white/5 ${
                  i === 0 ? 'bg-white/5' : ''
                } hover:bg-white/5 transition-colors`}
              >
                <td className="py-2 pr-4 text-gray-300 font-medium">{pt.label}</td>
                <td className="py-2 px-3 text-right font-mono text-red-400">₹{fmt(pt.conservative)}</td>
                <td className={`py-2 px-3 text-right font-mono font-semibold ${getPremiumColor(pt.base)}`}>₹{fmt(pt.base)}</td>
                <td className="py-2 px-3 text-right font-mono text-emerald-400">₹{fmt(pt.optimistic)}</td>
                <td className="py-2 pl-3 text-right font-mono text-rose-400">
                  {pt.thetaLoss > 0 ? `-₹${fmt(pt.thetaLoss)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 italic">
        * Theta modeled using square-root time decay (accelerates near expiry). Conservative scenario includes additional IV crush (-10%). Optimistic includes IV expansion (+12%) with 50% theta reduction.
      </p>
    </div>
  );
}
