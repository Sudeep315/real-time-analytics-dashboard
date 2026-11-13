import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { PieChart, ShieldAlert } from 'lucide-react';

export const DonutChart: React.FC = () => {
  const { liveEvents, currentMetric } = useDashboard();

  // Aggregate status codes
  const counts = {
    '200 OK': 0,
    '201 Created': 0,
    '304 Not Mod': 0,
    '4xx Client': 0,
    '5xx Error': 0,
  };

  liveEvents.forEach(e => {
    if (e.statusCode >= 200 && e.statusCode < 201) counts['200 OK']++;
    else if (e.statusCode === 201) counts['201 Created']++;
    else if (e.statusCode === 304) counts['304 Not Mod']++;
    else if (e.statusCode >= 400 && e.statusCode < 500) counts['4xx Client']++;
    else if (e.statusCode >= 500) counts['5xx Error']++;
    else counts['200 OK']++;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  const segments = [
    { label: '200 OK', count: counts['200 OK'], color: '#10b981', textColor: 'text-emerald-400' },
    { label: '201 Created', count: counts['201 Created'], color: '#06b6d4', textColor: 'text-cyan-400' },
    { label: '304 Cached', count: counts['304 Not Mod'], color: '#6366f1', textColor: 'text-indigo-400' },
    { label: '4xx Client', count: counts['4xx Client'], color: '#f59e0b', textColor: 'text-amber-400' },
    { label: '5xx Error', count: counts['5xx Error'], color: '#ef4444', textColor: 'text-rose-400' },
  ];

  // Calculate SVG donut stroke offsets
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const arcs = segments.map((seg) => {
    const percent = seg.count / total;
    const strokeDasharray = `${(percent * circumference).toFixed(2)} ${(circumference * (1 - percent)).toFixed(2)}`;
    const strokeDashoffset = (-accumulatedPercent * circumference).toFixed(2);
    accumulatedPercent += percent;
    return {
      ...seg,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Status Code Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            HTTP response code health distribution
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          N={liveEvents.length} events
        </span>
      </div>

      {/* SVG Donut & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-400 font-medium">Success Rate</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {(100 - currentMetric.errorRate).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-36">
          {arcs.map((arc, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: arc.color }} />
                <span className="text-slate-300 font-medium">{arc.label}</span>
              </div>
              <span className={`font-mono font-semibold ${arc.textColor}`}>
                {arc.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>WAF Filter active</span>
        </span>
        <span className="text-emerald-400 font-medium">99.2% Healthy</span>
      </div>
    </div>
  );
};

