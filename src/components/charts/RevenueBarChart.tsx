import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { BarChart3, ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../../utils/mockEngine';

export const RevenueBarChart: React.FC = () => {
  const { liveEvents } = useDashboard();

  // Aggregate event counts and latency per service
  const serviceStats = SERVICES.map(service => {
    const matching = liveEvents.filter(e => e.service === service);
    const count = matching.length;
    const errors = matching.filter(e => e.statusCode >= 400).length;
    const totalRev = matching.reduce((sum, e) => sum + (e.revenue || 0), 0);
    const avgLatency = count > 0 ? Math.round(matching.reduce((sum, e) => sum + e.latencyMs, 0) / count) : 45;

    return {
      service,
      displayName: service.replace('-service', '').replace('-api', '').replace('-db', ''),
      count: Math.max(count, 2),
      errors,
      revenue: Math.max(totalRev, 40),
      avgLatency
    };
  });

  const maxRevenue = Math.max(...serviceStats.map(s => s.revenue), 100);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Revenue & Volume by Microservice
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active service breakdown from live telemetry buffer
          </p>
        </div>
        <span className="text-xs text-emerald-400 font-mono font-medium flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          Live Aggregates
        </span>
      </div>

      {/* Bar Chart Container */}
      <div className="space-y-3 my-2">
        {serviceStats.map((item, idx) => {
          const percentage = Math.min(100, Math.round((item.revenue / maxRevenue) * 100));
          const colors = [
            'from-cyan-500 to-blue-600',
            'from-emerald-500 to-teal-600',
            'from-indigo-500 to-purple-600',
            'from-amber-500 to-orange-600',
            'from-sky-500 to-indigo-600',
            'from-pink-500 to-rose-600'
          ];
          const colorClass = colors[idx % colors.length];

          return (
            <div key={item.service} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 capitalize">
                  {item.displayName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {item.avgLatency}ms avg
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    ${item.revenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>6 Monitored Microservices</span>
        <span className="text-slate-400">Total buffer rev: <b className="text-white font-mono font-semibold">${serviceStats.reduce((s, i) => s + i.revenue, 0)}</b></span>
      </div>
    </div>
  );
};

