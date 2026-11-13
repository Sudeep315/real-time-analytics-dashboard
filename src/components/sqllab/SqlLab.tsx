import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Database, 
  CheckCircle, 
  Clock, 
  Table as TableIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DATASET_SCHEMAS, executeMockQuery, downloadAsCsv, downloadAsJson } from '../../utils/mockEngine';
import { SqlQueryResult } from '../../types';

export const SqlLab: React.FC = () => {
  const { liveEvents } = useDashboard();
  
  const [selectedTable, setSelectedTable] = useState(DATASET_SCHEMAS[0].name);
  const [sqlQuery, setSqlQuery] = useState<string>(
    `SELECT region, COUNT(*) as event_count, AVG(latencyMs) as avg_latency_ms, SUM(CASE WHEN statusCode >= 400 THEN 1 ELSE 0 END) as error_count\nFROM events\nGROUP BY region;`
  );
  
  const [result, setResult] = useState<SqlQueryResult>(() => 
    executeMockQuery(sqlQuery, liveEvents)
  );
  
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const currentSchema = DATASET_SCHEMAS.find(s => s.name === selectedTable) || DATASET_SCHEMAS[0];

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = executeMockQuery(sqlQuery, liveEvents);
      setResult(res);
      setIsRunning(false);
    }, 250);
  };

  const handleTemplateClick = (sql: string) => {
    setSqlQuery(sql);
  };

  const handleDownloadCsv = () => {
    if (result.rows.length > 0) {
      downloadAsCsv(`sql-query-result-${Date.now()}`, result.rows);
    }
  };

  const handleDownloadJson = () => {
    if (result.rows.length > 0) {
      downloadAsJson(`sql-query-result-${Date.now()}`, result.rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              SQL Lab & Data Explorer
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Superset SQL Lab Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Query real-time event telemetry, aggregate metrics, and export data across connected clusters
          </p>
        </div>

        {/* Quick Query Templates */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Templates:
          </span>
          <button
            onClick={() => handleTemplateClick(
              `SELECT region, COUNT(*) as event_count, AVG(latencyMs) as avg_latency_ms\nFROM events\nGROUP BY region;`
            )}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Regional Latency
          </button>
          <button
            onClick={() => handleTemplateClick(
              `SELECT service, COUNT(*) as request_count, AVG(latencyMs) as avg_latency_ms\nFROM events\nGROUP BY service;`
            )}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Service Benchmark
          </button>
          <button
            onClick={() => handleTemplateClick(
              `SELECT * FROM events\nWHERE statusCode >= 400\nORDER BY latencyMs DESC\nLIMIT 20;`
            )}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Errors & Exceptions
          </button>
          <button
            onClick={() => handleTemplateClick(
              `SELECT * FROM transactions\nORDER BY amount_usd DESC\nLIMIT 10;`
            )}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Top Transactions
          </button>
        </div>
      </div>

      {/* SQL Workspace: Left Schema Browser + Right Editor & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Schema Navigator */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-cyan-400" />
              <span>Schemas & Tables</span>
            </span>
            <span className="text-[10px] text-slate-400">PostgreSQL / Trino</span>
          </div>

          {/* Table Selector */}
          <div className="space-y-1.5">
            {DATASET_SCHEMAS.map(schema => (
              <button
                key={schema.name}
                onClick={() => setSelectedTable(schema.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                  selectedTable === schema.name
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>public.{schema.name}</span>
                <span className="text-[10px] text-slate-500 font-sans">
                  ~{(schema.rowCountEstimate / 1000).toFixed(0)}k rows
                </span>
              </button>
            ))}
          </div>

          {/* Columns in Selected Table */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Columns in <code className="text-cyan-400 lowercase">{currentSchema.name}</code>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {currentSchema.columns.map(col => (
                <div
                  key={col.name}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/40"
                >
                  <span className="font-mono text-slate-300">{col.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SQL Editor & Output */}
        <div className="lg:col-span-3 space-y-4">
          {/* Query Editor Box */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>SQL Query Editor</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Live Execution Ready
                </span>
              </span>
              <button
                onClick={() => setSqlQuery('')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* SQL Textarea */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={5}
                placeholder="Write SQL query here..."
                className="w-full p-3 font-mono text-xs text-cyan-300 bg-transparent focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400">
                Supports: <code className="text-slate-300">SELECT, WHERE, GROUP BY, ORDER BY, LIMIT</code>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Query Results
                </h4>
                {result.status === 'success' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{result.rowCount} rows</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{result.executionTimeMs} ms</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Download Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  disabled={result.rows.length === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button
                  onClick={handleDownloadJson}
                  disabled={result.rows.length === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3 h-3" /> JSON
                </button>
              </div>
            </div>

            {/* Error banner if query fails */}
            {result.status === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{result.error}</span>
              </div>
            )}

            {/* Table of Results */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40 max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    {result.columns.map(col => (
                      <th key={col.name} className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-slate-200">{col.name}</span>
                        <span className="text-[9px] text-slate-500 block font-normal">{col.type}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.rows.length === 0 ? (
                    <tr>
                      <td colSpan={result.columns.length || 1} className="py-8 text-center text-slate-500 font-sans">
                        No rows returned. Execute a query above to see output.
                      </td>
                    </tr>
                  ) : (
                    result.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                        {result.columns.map(col => (
                          <td key={col.name} className="py-2 px-3 text-slate-300 whitespace-nowrap">
                            {String(row[col.name] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

