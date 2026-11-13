import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TrendingUp, Layers, Info } from 'lucide-react';

export const RealtimeAreaChart: React.FC = () => {
  const { history, burstMode } = useDashboard();
  const [metricType, setMetricType] = useState<'requests' | 'bandwidth'>('requests');

  const data = history.slice(-25);
  const values = data.map(d => metricType === 'requests' ? d.requestsPerSec : d.bandwidthMbps);
  
  const minVal = Math.min(...values, metricType === 'requests' ? 500 : 50);
  const maxVal = Math.max(...values, metricType === 'requests' ? 2500 : 250);
  const range = Math.max(1, maxVal - minVal);

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Build SVG points
  const points = data.map((d, i) => {
    const val = metricType === 'requests' ? d.requestsPerSec : d.bandwidthMbps;
    const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
    const y = padding.top + chartH - ((val - minVal) / range) * chartH;
    return { x, y, val, label: d.timeLabel };
  });

  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = points.length > 0 
    ? `${points[0].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} ${polylineStr} ${points[points.length - 1].x.toFixed(1)},${(padding.top + chartH).toFixed(1)}`
    : '';

  // Generate 4 horizontal gridlines
  const gridLines = [0, 0.33, 0.66, 1].map(ratio => {
    const val = Math.round(minVal + (1 - ratio) * range);
    const y = padding.top + ratio * chartH;
    return { val, y };
  });

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              {metricType === 'requests' ? 'Live Ingestion Throughput' : 'Network Bandwidth Stream'}
            </h3>
            {burstMode && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold border border-rose-500/30 animate-pulse">
                TRAFFIC BURST
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sliding 25-point real-time window with sub-second resolution
          </p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMetricType('requests')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              metricType === 'requests'
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TPS (req/s)
          </button>
          <button
            onClick={() => setMetricType('bandwidth')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              metricType === 'bandwidth'
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            I/O (Mbps)
          </button>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="w-full relative overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {gridLines.map((gl, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={gl.y}
                x2={width - padding.right}
                y2={gl.y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <text
                x={padding.left - 10}
                y={gl.y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {gl.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaStr && (
            <polygon
              points={areaStr}
              fill="url(#areaGradient)"
            />
          )}

          {/* Main Trend Line */}
          {polylineStr && (
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              points={polylineStr}
            />
          )}

          {/* Current Latest Point Pulse Dot */}
          {points.length > 0 && (
            <g>
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="7"
                fill="#06b6d4"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4.5"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X-axis labels (first, middle, last) */}
          {points.length > 0 && (
            <>
              <text
                x={padding.left}
                y={height - 8}
                textAnchor="start"
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[0].label}
              </text>
              <text
                x={padding.left + chartW / 2}
                y={height - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[Math.floor(points.length / 2)].label}
              </text>
              <text
                x={width - padding.right}
                y={height - 8}
                textAnchor="end"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
              >
                {points[points.length - 1].label} (Now)
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Min: <b className="text-slate-200 font-mono">{minVal.toLocaleString()}</b></span>
          <span>Max: <b className="text-cyan-400 font-mono">{maxVal.toLocaleString()}</b></span>
          <span>Avg: <b className="text-slate-200 font-mono">{Math.round((minVal + maxVal) / 2).toLocaleString()}</b></span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Real-time smooth stream interpolation</span>
        </div>
      </div>
    </div>
  );
};

