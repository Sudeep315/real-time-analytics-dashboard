import React, { useState } from 'react';
import { 
  Rocket, 
  Terminal, 
  Check, 
  Copy, 
  Layers, 
  Server, 
  Cloud, 
  ShieldCheck, 
  Globe, 
  CheckCircle2 
} from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const deployOptions = [
    {
      title: 'Docker & Docker Compose',
      desc: 'Single command production container with multi-stage build and built-in WebSocket server.',
      cmd: 'docker-compose up -d --build',
      tag: 'Recommended for Self-Hosting',
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
    },
    {
      title: 'Local / Dedicated Linux VPS',
      desc: 'Build optimized static assets and launch the high-performance Express/WS server.',
      cmd: 'npm run build\nnpm run start',
      tag: 'Direct Node.js Execution',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    },
    {
      title: 'Vercel / Netlify (Frontend Only)',
      desc: 'Instant zero-configuration edge CDN deployment with automatic continuous integration.',
      cmd: 'vercel --prod',
      tag: 'Edge CDN',
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
    },
    {
      title: 'Render / Railway Blueprint',
      desc: 'Automated full-stack cloud hosting using the included render.yaml blueprint.',
      cmd: 'git push origin main',
      tag: 'PaaS Blueprint',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Production Deployment & Architecture
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Turnkey Production Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized production configurations ready for Docker containers, Cloud platforms, and CI/CD pipelines
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span>Zero External Dependencies Required</span>
        </div>
      </div>

      {/* Deployment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deployOptions.map((opt, i) => (
          <div key={i} className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{opt.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${opt.color}`}>
                  {opt.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{opt.desc}</p>
            </div>

            {/* Code Box */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs flex items-center justify-between">
              <pre className="text-cyan-300 overflow-x-auto whitespace-pre-line">{opt.cmd}</pre>
              <button
                onClick={() => copyToClipboard(opt.cmd, i)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-2 shrink-0"
              >
                {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture & Environment Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Architecture flow */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              System Architecture Flow
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-cyan-400">[1] Ingestion Layer</span>
              <span className="text-slate-400 font-sans text-[11px]">HTTP REST API + High-frequency WebSocket (/ws)</span>
            </div>
            <div className="flex justify-center text-slate-600">&darr;</div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-emerald-400">[2] Real-time Buffer</span>
              <span className="text-slate-400 font-sans text-[11px]">Sub-second sliding metric window + Anomaly detector</span>
            </div>
            <div className="flex justify-center text-slate-600">&darr;</div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-indigo-400">[3] Analytical Engine</span>
              <span className="text-slate-400 font-sans text-[11px]">In-Memory SQL query runner + Dynamic aggregations</span>
            </div>
            <div className="flex justify-center text-slate-600">&darr;</div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-400">[4] Visualization UI</span>
              <span className="text-slate-400 font-sans text-[11px]">React 18 + Tailwind Glassmorphic Live Dashboards</span>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Environment Variables (.env)
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">PORT=5000</div>
              <div className="text-slate-400 text-[11px] font-sans">HTTP and WebSocket server port</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">NODE_ENV=production</div>
              <div className="text-slate-400 text-[11px] font-sans">Production performance mode</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">STREAM_INTERVAL_MS=1500</div>
              <div className="text-slate-400 text-[11px] font-sans">WebSocket broadcast frequency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

