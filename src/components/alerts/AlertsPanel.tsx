import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Sliders, 
  ShieldAlert, 
  Clock, 
  Flame 
} from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const { alerts, acknowledgeAlert, clearAlerts, currentMetric, toggleBurstMode, burstMode } = useDashboard();
  
  const [errorThreshold, setErrorThreshold] = useState(5.0);
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [latencyThreshold, setLatencyThreshold] = useState(200);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Real-time Alerts & Anomaly Detection
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Active Rule Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated threshold monitoring for SLA breaches, edge latency spikes, and system anomalies
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleBurstMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              burstMode
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{burstMode ? 'Burst Triggered!' : 'Trigger Anomaly Burst'}</span>
          </button>

          <button
            onClick={clearAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Active Alerts + Right Threshold Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Alerts Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Incident & Anomaly Log ({alerts.length})</span>
            </span>
            <span className="text-xs text-slate-400">Auto-detected via live telemetry</span>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto" />
                <p className="text-sm font-medium text-slate-300">All systems operating within defined SLAs.</p>
                <p className="text-xs text-slate-500">No active alerts. Trigger a burst to test anomaly notifications.</p>
              </div>
            ) : (
              alerts.map(alert => {
                const isCrit = alert.severity === 'critical';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.acknowledged
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : isCrit
                        ? 'bg-rose-500/10 border-rose-500/30 shadow-md shadow-rose-500/10'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        isCrit ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {alert.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCrit ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Metric: <b className="text-slate-200 font-mono">{alert.metric}</b></span>
                          <span>Value: <b className="text-rose-400 font-mono">{alert.currentValue}</b></span>
                          <span>Threshold: <b className="text-slate-300 font-mono">{alert.threshold}</b></span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="self-end sm:self-center text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Threshold Rules Tuner */}
        <div className="glass-panel rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Threshold Rules</span>
            </span>
            <span className="text-[10px] text-slate-400">Dynamic</span>
          </div>

          {/* Rule 1: Error Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Max Error Rate:</span>
              <span className="text-rose-400 font-mono font-bold">{errorThreshold}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={errorThreshold}
              onChange={(e) => setErrorThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Current: {currentMetric.errorRate}%</span>
              <span>Trigger if &gt; {errorThreshold}%</span>
            </div>
          </div>

          {/* Rule 2: CPU Utilization */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Max CPU Utilization:</span>
              <span className="text-amber-400 font-mono font-bold">{cpuThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={cpuThreshold}
              onChange={(e) => setCpuThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Current: {currentMetric.cpuUsage}%</span>
              <span>Trigger if &gt; {cpuThreshold}%</span>
            </div>
          </div>

          {/* Rule 3: Latency SLA */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">P95 SLA Latency:</span>
              <span className="text-cyan-400 font-mono font-bold">{latencyThreshold} ms</span>
            </div>
            <input
              type="range"
              min="80"
              max="500"
              step="10"
              value={latencyThreshold}
              onChange={(e) => setLatencyThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Current: {currentMetric.latencyMs}ms</span>
              <span>Trigger if &gt; {latencyThreshold}ms</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Webhook Notification:</span>
            <p>Alert triggers automatically dispatches webhook payloads to configured Slack / PagerDuty endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

