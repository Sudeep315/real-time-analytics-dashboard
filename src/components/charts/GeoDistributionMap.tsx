import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Globe2, Radio, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

export const GeoDistributionMap: React.FC = () => {
  const { regions, filters, setFilters } = useDashboard();

  const handleSelectRegion = (regionCode: string) => {
    setFilters(prev => ({
      ...prev,
      region: prev.region === regionCode ? 'All' : regionCode
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Global Edge PoPs & Regional Health
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any region to filter global dashboard metrics
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>5/5 PoPs Active</span>
        </div>
      </div>

      {/* Grid of Regions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 my-2">
        {regions.map((r) => {
          const isSelected = filters.region === r.region;
          const isWarning = r.status === 'warning';

          return (
            <div
              key={r.region}
              onClick={() => handleSelectRegion(r.region)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white font-mono">
                  {r.region}
                </span>
                {isWarning ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>

              {/* Region description */}
              <div className="text-[11px] text-slate-400 truncate mb-3">
                {r.name}
              </div>

              {/* Metrics */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Traffic:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {(r.requests / 1000).toFixed(1)}k req
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Latency:</span>
                  <span className={`font-mono font-medium ${r.latency > 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {r.latency} ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Users:</span>
                  <span className="font-mono text-cyan-400">
                    {(r.users / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Selected indicator badge */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Anycast Routing Enabled &bull; DNS Failover Configured</span>
        <span className="text-cyan-400 font-medium">
          {filters.region === 'All' ? 'Showing: All Regions' : `Filtered: ${filters.region}`}
        </span>
      </div>
    </div>
  );
};

