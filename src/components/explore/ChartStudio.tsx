import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  AreaChart, 
  Gauge, 
  Palette, 
  Save, 
  Eye, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { DATASET_SCHEMAS } from '../../utils/mockEngine';

export const ChartStudio: React.FC = () => {
  const { history, currentMetric, liveEvents } = useDashboard();

  const [selectedDataset, setSelectedDataset] = useState('events');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'donut' | 'gauge'>('area');
  const [metric, setMetric] = useState<'requests' | 'revenue' | 'latency' | 'errors'>('requests');
  const [dimension, setDimension] = useState<'region' | 'service' | 'status'>('region');
  const [chartTitle, setChartTitle] = useState('Real-time Regional Throughput');
  const [colorTheme, setColorTheme] = useState<'cyan' | 'emerald' | 'amber' | 'purple'>('cyan');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // Prepare preview data based on selections
  const previewPoints = history.slice(-20).map((h, i) => {
    let val = h.requestsPerSec;
    if (metric === 'revenue') val = h.revenue;
    if (metric === 'latency') val = h.latencyMs;
    if (metric === 'errors') val = Math.round(h.errorRate * 10);
    return { label: h.timeLabel, val, i };
  });

  const maxVal = Math.max(...previewPoints.map(p => p.val), 50);

  const colorMap = {
    cyan: { stroke: '#06b6d4', fill: 'from-cyan-500/40 to-cyan-500/0', bar: 'bg-cyan-500', text: 'text-cyan-400' },
    emerald: { stroke: '#10b981', fill: 'from-emerald-500/40 to-emerald-500/0', bar: 'bg-emerald-500', text: 'text-emerald-400' },
    amber: { stroke: '#f59e0b', fill: 'from-amber-500/40 to-amber-500/0', bar: 'bg-amber-500', text: 'text-amber-400' },
    purple: { stroke: '#8b5cf6', fill: 'from-purple-500/40 to-purple-500/0', bar: 'bg-purple-500', text: 'text-purple-400' },
  };

  const themeColors = colorMap[colorTheme];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Chart Studio & Visual Slice Builder
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Superset Explore Equivalent
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Design, customize, and configure real-time charts directly from active telemetry streams
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
        >
          <Save className="w-4 h-4" />
          <span>{savedNotice ? 'Saved to Dashboard!' : 'Add to Dashboard'}</span>
        </button>
      </div>

      {/* Main Studio Grid: Left Config Panel + Right Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Controls */}
        <div className="glass-panel rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Chart Configuration</span>
            </span>
            <span className="text-[10px] text-slate-400">Step-by-step</span>
          </div>

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Dataset Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Source Dataset</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {DATASET_SCHEMAS.map(d => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.rowCountEstimate.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Visualization Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'area', label: 'Area Stream', icon: <AreaChart className="w-3.5 h-3.5" /> },
                { id: 'bar', label: 'Multi Bar', icon: <BarChart className="w-3.5 h-3.5" /> },
                { id: 'donut', label: 'Donut Slice', icon: <PieChart className="w-3.5 h-3.5" /> },
                { id: 'gauge', label: 'KPI Gauge', icon: <Gauge className="w-3.5 h-3.5" /> },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    chartType === type.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Metric (Y-Axis)</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="requests">Requests per Second (TPS)</option>
              <option value="revenue">Real-time Revenue ($)</option>
              <option value="latency">P95 Response Latency (ms)</option>
              <option value="errors">Error Rate Percentage (%)</option>
            </select>
          </div>

          {/* Dimension Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Group By Dimension (X-Axis)</label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="region">Edge Region (US, EU, AP, SA)</option>
              <option value="service">Microservice Name</option>
              <option value="status">HTTP Response Code</option>
            </select>
          </div>

          {/* Color Palette Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" /> Color Accent
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'cyan', bg: 'bg-cyan-500' },
                { id: 'emerald', bg: 'bg-emerald-500' },
                { id: 'amber', bg: 'bg-amber-500' },
                { id: 'purple', bg: 'bg-purple-500' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setColorTheme(c.id as any)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                    colorTheme === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Canvas Preview */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {chartTitle || 'Live Visualization Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-emerald-400 font-mono">Live Studio Preview</span>
              </div>
            </div>

            {/* Render Preview according to selected chart type */}
            {chartType === 'area' && (
              <div className="space-y-4">
                <div className="h-64 flex items-end gap-1.5 p-4 bg-slate-950/70 rounded-xl border border-slate-800 relative">
                  {previewPoints.map((pt, i) => {
                    const heightPercent = Math.max(8, Math.round((pt.val / maxVal) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div
                          className={`w-full rounded-t ${themeColors.bar} transition-all duration-300 opacity-80 group-hover:opacity-100`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-slate-500 font-mono mt-1 hidden group-hover:block absolute bottom-1">
                          {pt.val}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-400 px-2 font-mono">
                  <span>{previewPoints[0]?.label}</span>
                  <span>Aggregation: SUM({metric})</span>
                  <span className={themeColors.text}>{previewPoints[previewPoints.length - 1]?.label} (Now)</span>
                </div>
              </div>
            )}

            {chartType === 'bar' && (
              <div className="space-y-4 py-4">
                {['US-East', 'EU-Central', 'US-West', 'AP-South', 'SA-East'].map((name, idx) => {
                  const val = Math.round(maxVal * (0.9 - idx * 0.15));
                  const pct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-mono">{name}</span>
                        <span className={`font-mono font-bold ${themeColors.text}`}>{val.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${themeColors.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {chartType === 'donut' && (
              <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-36 h-36 rounded-full border-8 border-cyan-500 border-t-indigo-500 border-r-emerald-500 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-xl font-bold font-mono text-white">{currentMetric.requestsPerSec}</span>
                    <span className="text-[10px] text-slate-400 block">Total Slice</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-6 text-xs text-slate-300">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Slice A (52%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Slice B (30%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Slice C (18%)</span>
                </div>
              </div>
            )}

            {chartType === 'gauge' && (
              <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative w-48 h-24 overflow-hidden mb-2">
                  <div className="w-48 h-48 rounded-full border-8 border-slate-800 border-t-cyan-500 border-l-cyan-500 transform -rotate-45" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-cyan-400">
                  {currentMetric.requestsPerSec} <span className="text-sm text-slate-400 font-normal">req/s</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Optimal operating zone: 1,000 - 4,000 req/s</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Query execution: Cached in-memory &bull; 0ms latency</span>
            <span className="text-slate-300 font-mono">Dataset: public.{selectedDataset}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

