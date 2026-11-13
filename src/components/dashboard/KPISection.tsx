import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Zap, 
  DollarSign, 
  Users, 
  Timer, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

export const KPISection: React.FC = () => {
  const { currentMetric, history, burstMode } = useDashboard();

  // Calculate sparkline points
  const reqHistory = history.slice(-15).map(h => h.requestsPerSec);
  const minReq = Math.min(...reqHistory, 100);
  const maxReq = Math.max(...reqHistory, 200);
  const reqRange = Math.max(1, maxReq - minReq);
  
  const sparklinePoints = reqHistory
    .map((val, idx) => {
      const x = (idx / (reqHistory.length - 1)) * 100;
      const y = 30 - ((val - minReq) / reqRange) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isErrorHigh = currentMetric.errorRate > 3.0;
  const isLatencyHigh = currentMetric.latencyMs > 150;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* KPI 1: Ingest Rate / TPS */}
      <div className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Throughput (TPS)
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-white font-mono flex items-baseline gap-1">
            <span>{currentMetric.requestsPerSec.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">req/s</span>
          </div>

          {/* Sparkline SVG */}
          <div className="h-8 w-full mt-2">
            <svg viewBox="0 0 100 32" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className="text-emerald-400 flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {burstMode ? '+118% (Spike)' : '+8.4%'}
          </span>
          <span className="text-slate-400 text-[11px]">vs last min</span>
        </div>
      </div>

      {/* KPI 2: Real-time Revenue */}
      <div className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Live Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-emerald-400 font-mono flex items-baseline gap-1">
            <span>${(currentMetric.revenue * 60).toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">/hr</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Current tick: <span className="text-slate-200 font-mono font-medium">${currentMetric.revenue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className="text-emerald-400 flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +14.2%
          </span>
          <span className="text-slate-400 text-[11px]">Target: $9.5k/h</span>
        </div>
      </div>

      {/* KPI 3: Active Users */}
      <div className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Connected Users
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {currentMetric.activeUsers.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            5 Global Edges Active
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className="text-indigo-400 flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +640/min
          </span>
          <span className="text-slate-400 text-[11px]">Peak: 84.2k</span>
        </div>
      </div>

      {/* KPI 4: P95 Latency */}
      <div className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            P95 Latency
          </span>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
            isLatencyHigh 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
          }`}>
            <Timer className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className={`text-2xl font-bold tracking-tight font-mono flex items-baseline gap-1 ${
            isLatencyHigh ? 'text-rose-400 animate-pulse' : 'text-white'
          }`}>
            <span>{currentMetric.latencyMs}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">ms</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            SLA Threshold: &lt; 200ms
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className={isLatencyHigh ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
            {isLatencyHigh ? 'Degraded SLA' : 'Optimal SLA'}
          </span>
          <span className="text-slate-400 text-[11px]">Edge P95</span>
        </div>
      </div>

      {/* KPI 5: Error Rate */}
      <div className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Error Rate
          </span>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
            isErrorHigh 
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className={`text-2xl font-bold tracking-tight font-mono flex items-baseline gap-1 ${
            isErrorHigh ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <span>{currentMetric.errorRate}%</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Status: {isErrorHigh ? 'Anomaly Alert!' : 'Normal (99.9% Up)'}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <span className={isErrorHigh ? 'text-rose-400 flex items-center font-bold' : 'text-emerald-400 flex items-center'}>
            {isErrorHigh ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isErrorHigh ? 'High Alert' : 'Within Budget'}
          </span>
          <span className="text-slate-400 text-[11px]">Goal: &lt; 1%</span>
        </div>
      </div>
    </div>
  );
};

