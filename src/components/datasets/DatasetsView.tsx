import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Database, Table, Key, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { DATASET_SCHEMAS } from '../../utils/mockEngine';

export const DatasetsView: React.FC = () => {
  const { setActiveTab } = useDashboard();
  const [activeSchema, setActiveSchema] = useState(DATASET_SCHEMAS[0]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Datasets & Metadata Registry
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Superset Datasets Equivalent
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse registered virtual datasets, physical tables, data types, and primary keys
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sqllab')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20"
          >
            <span>Query in SQL Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Datasets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Datasets List */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>Available Datasets</span>
          </div>

          <div className="space-y-2">
            {DATASET_SCHEMAS.map(d => {
              const isSelected = activeSchema.name === d.name;
              return (
                <div
                  key={d.name}
                  onClick={() => setActiveSchema(d)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{d.name}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {d.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{d.columns.length} columns</span>
                    <span>~{(d.rowCountEstimate / 1000).toFixed(0)}k rows</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Schema Details & Columns */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-cyan-400">public.{activeSchema.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Physical Table
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeSchema.description}</p>
            </div>

            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <span>Build Chart with this Dataset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Columns Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Nullable</th>
                  <th className="py-2.5 px-3">Key Attribute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeSchema.columns.map(col => (
                  <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {col.name}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">
                      {col.type}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {col.nullable ? 'YES' : 'NO'}
                    </td>
                    <td className="py-2.5 px-3">
                      {col.primaryKey ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Key className="w-2.5 h-2.5" /> PRIMARY KEY
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

