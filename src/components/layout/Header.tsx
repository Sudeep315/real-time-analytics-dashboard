import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2, 
  Download, 
  Flame, 
  Radio
} from 'lucide-react';
import { downloadAsJson } from '../../utils/mockEngine';

export const Header: React.FC = () => {
  const { 
    isStreaming, 
    toggleStreaming, 
    burstMode, 
    toggleBurstMode, 
    theme, 
    toggleTheme, 
    wsConnected, 
    connectionType,
    currentMetric,
    history 
  } = useDashboard();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleExportSnapshot = () => {
    downloadAsJson(`analytics-dashboard-snapshot-${Date.now()}`, {
      timestamp: new Date().toISOString(),
      currentMetric,
      historyLength: history.length,
      recentMetrics: history.slice(-10),
    });
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Real-time Analytics Dashboard</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Apache Superset Architecture Reference &bull; Live Telemetry Engine
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection status pill */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          wsConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
          <span>{wsConnected ? 'WebSocket Live' : 'High-Freq Stream'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Burst Mode Simulator Toggle */}
        <button
          onClick={toggleBurstMode}
          title={burstMode ? 'Disable Traffic Burst' : 'Simulate Traffic Spike / Flash Sale'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            burstMode
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30 animate-pulse ring-2 ring-rose-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${burstMode ? 'text-white' : 'text-amber-400'}`} />
          <span className="hidden sm:inline">{burstMode ? 'Burst Active!' : 'Simulate Spike'}</span>
        </button>

        {/* Play / Pause Stream Toggle */}
        <button
          onClick={toggleStreaming}
          title={isStreaming ? 'Pause streaming updates' : 'Resume streaming updates'}
          className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
            isStreaming
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
          }`}
        >
          {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Snapshot Export */}
        <button
          onClick={handleExportSnapshot}
          title="Export Telemetry JSON Snapshot"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Fullscreen / NOC Mode Toggle */}
        <button
          onClick={toggleFullscreen}
          title="Toggle NOC Display Mode"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors hidden sm:flex"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};

