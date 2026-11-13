import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  LayoutDashboard, 
  LineChart, 
  Terminal, 
  BellRing, 
  Database, 
  Rocket, 
  Cpu, 
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { TabType } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, currentMetric } = useDashboard();
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Live Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'explore',
      label: 'Chart Studio',
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      id: 'sqllab',
      label: 'SQL Lab',
      icon: <Terminal className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: 'Alerts & Anomalies',
      icon: <BellRing className="w-5 h-5" />,
      badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : undefined,
    },
    {
      id: 'datasets',
      label: 'Datasets & Schemas',
      icon: <Database className="w-5 h-5" />,
    },
    {
      id: 'deployment',
      label: 'Deploy & Cloud Guide',
      icon: <Rocket className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation list */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Cluster Health Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cluster Telemetry</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              HEALTHY
            </span>
          </div>

          {/* CPU Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" /> CPU Load
              </span>
              <span className={currentMetric.cpuUsage > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {currentMetric.cpuUsage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  currentMetric.cpuUsage > 80 ? 'bg-rose-500' : currentMetric.cpuUsage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${currentMetric.cpuUsage}%` }}
              />
            </div>
          </div>

          {/* Memory Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> RAM Allocation
              </span>
              <span className="text-slate-300 font-mono">
                {currentMetric.memoryUsage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${currentMetric.memoryUsage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex justify-between items-center text-slate-400">
          <span>Engine v2.4.0</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
            Streaming
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          Ready to deploy on Docker & Cloud
        </p>
      </div>
    </aside>
  );
};
