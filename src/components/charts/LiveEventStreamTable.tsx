import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { ListFilter, Search, Download, ExternalLink, X, Code2 } from 'lucide-react';
import { LiveEvent } from '../../types';
import { downloadAsCsv } from '../../utils/mockEngine';

export const LiveEventStreamTable: React.FC = () => {
  const { liveEvents, filters } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);

  // Filter events based on active filters and local search
  const filteredEvents = liveEvents.filter(e => {
    if (filters.region !== 'All' && e.region !== filters.region) return false;
    if (filters.service !== 'All' && e.service !== filters.service) return false;
    if (filters.statusCode === '200' && e.statusCode !== 200) return false;
    if (filters.statusCode === '4xx' && (e.statusCode < 400 || e.statusCode >= 500)) return false;
    if (filters.statusCode === '5xx' && e.statusCode < 500) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.endpoint.toLowerCase().includes(q) ||
        e.service.toLowerCase().includes(q) ||
        e.userId.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        String(e.statusCode).includes(q)
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    downloadAsCsv(`live-telemetry-events-${Date.now()}`, filteredEvents);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'POST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (code >= 300 && code < 400) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Live Ingest Stream & HTTP Trace Log
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sliding buffer showing HTTP transactions, status codes, and microservice traces
          </p>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search traces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={handleExportCsv}
            title="Download CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Method</th>
              <th className="py-2.5 px-3">Endpoint</th>
              <th className="py-2.5 px-3">Service</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Latency</th>
              <th className="py-2.5 px-3">Region</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                  No events match the active filters.
                </td>
              </tr>
            ) : (
              filteredEvents.slice(0, 15).map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {evt.timestamp.split('T')[1].substring(0, 8)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadge(evt.method)}`}>
                      {evt.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-200 truncate max-w-xs group-hover:text-cyan-300 transition-colors">
                    {evt.endpoint}
                  </td>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px] font-sans">
                    {evt.service}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(evt.statusCode)}`}>
                      {evt.statusCode}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                    <span className={evt.latencyMs > 150 ? 'text-rose-400 font-bold' : ''}>
                      {evt.latencyMs}ms
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                    {evt.region}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Inspector for Event Details */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getMethodBadge(selectedEvent.method)}`}>
                  {selectedEvent.method}
                </span>
                <h4 className="text-sm font-bold text-white font-mono">
                  {selectedEvent.endpoint}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Payload Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Trace ID:</span>
                  <p className="font-mono text-cyan-400 font-semibold">{selectedEvent.id}</p>
                </div>
                <div>
                  <span className="text-slate-400">User ID:</span>
                  <p className="font-mono text-slate-200">{selectedEvent.userId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Service:</span>
                  <p className="text-slate-200">{selectedEvent.service}</p>
                </div>
                <div>
                  <span className="text-slate-400">Region:</span>
                  <p className="text-slate-200">{selectedEvent.region}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status Code:</span>
                  <p className="font-mono text-emerald-400 font-bold">{selectedEvent.statusCode}</p>
                </div>
                <div>
                  <span className="text-slate-400">Response Latency:</span>
                  <p className="font-mono text-white font-bold">{selectedEvent.latencyMs} ms</p>
                </div>
              </div>

              {selectedEvent.revenue && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                  <span className="text-emerald-400 font-medium">Associated Order Revenue:</span>
                  <span className="text-lg font-bold font-mono text-emerald-300">${selectedEvent.revenue}</span>
                </div>
              )}

              {selectedEvent.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-rose-400 font-semibold block mb-1">Captured Exception:</span>
                  <code className="text-rose-300 font-mono text-[11px] block">{selectedEvent.error}</code>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Showing {Math.min(15, filteredEvents.length)} of {filteredEvents.length} buffer events</span>
        <span className="text-slate-500 text-[11px]">Click any row to inspect trace payload</span>
      </div>
    </div>
  );
};

