import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Filter, RotateCcw, Clock, Globe, Server, AlertCircle } from 'lucide-react';
import { SERVICES } from '../../utils/mockEngine';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useDashboard();

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filters</span>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {(['5m', '15m', '1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setFilters((f) => ({ ...f, timeRange: range }))}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filters.timeRange === range
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Region Filter */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={filters.region}
            onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
            className="pl-8 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
          >
            <option value="All">All Regions</option>
            <option value="US-East">US-East (N. Virginia)</option>
            <option value="US-West">US-West (Oregon)</option>
            <option value="EU-Central">EU-Central (Frankfurt)</option>
            <option value="AP-South">AP-South (Mumbai)</option>
            <option value="SA-East">SA-East (São Paulo)</option>
          </select>
        </div>

        {/* Status Code Filter */}
        <div className="relative flex items-center">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={filters.statusCode}
            onChange={(e) => setFilters((f) => ({ ...f, statusCode: e.target.value }))}
            className="pl-8 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
          >
            <option value="All">All Status Codes</option>
            <option value="200">200 OK (Success)</option>
            <option value="4xx">4xx (Client Errors)</option>
            <option value="5xx">5xx (Server Errors)</option>
          </select>
        </div>

        {/* Microservice Filter */}
        <div className="relative flex items-center">
          <Server className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={filters.service}
            onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))}
            className="pl-8 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
          >
            <option value="All">All Services</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stream Frequency & Reset */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Stream Hz:</span>
          <select
            value={filters.refreshRateMs}
            onChange={(e) => setFilters((f) => ({ ...f, refreshRateMs: Number(e.target.value) }))}
            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-semibold focus:outline-none cursor-pointer"
          >
            <option value={500}>0.5s (2.0 Hz)</option>
            <option value={1000}>1.0s (1.0 Hz)</option>
            <option value={1500}>1.5s (0.6 Hz)</option>
            <option value={3000}>3.0s (0.3 Hz)</option>
            <option value={5000}>5.0s (0.2 Hz)</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          title="Reset all filters"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

