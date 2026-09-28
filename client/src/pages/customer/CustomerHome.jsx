import React, { useState, useEffect } from 'react';
import { checkHealth } from '../../services/api';
import { Activity, Server, Database, CheckCircle2, AlertCircle, RefreshCw, Layers, Code2, Cpu } from 'lucide-react';

export const CustomerHome = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setApiStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Full-Stack Ready Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Node.js Express + React Vite Monorepo
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Cleanly separated customer web application and admin portal, equipped with Mongoose database models, Tailwind CSS styling, and RESTful API routes.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Verify API Connection</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live API Connection Verification Banner */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Live Express API Status</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">GET /api/health</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 space-x-3 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Checking connection to http://localhost:5000...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Backend Connection Failed</p>
              <p className="text-xs text-rose-400/80 mt-1">{error}</p>
              <p className="text-xs text-slate-400 mt-2">
                Make sure the Express backend is running (`npm run dev:server` or `node server/index.js`).
              </p>
            </div>
          </div>
        ) : apiStatus ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{apiStatus.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">Response Time: {new Date(apiStatus.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Server className="w-4 h-4 text-indigo-400" /> Server:</span>
                <span className="text-emerald-400 font-bold">{apiStatus.services?.server}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Database className="w-4 h-4 text-violet-400" /> Database:</span>
                <span className="text-indigo-300 font-bold">{apiStatus.services?.database}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="w-4 h-4 text-cyan-400" /> Mode:</span>
                <span className="text-slate-200 capitalize">{apiStatus.environment}</span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Tech Stack Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100">React.js & Vite</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ultra-fast dev server and HMR using Vite, preconfigured with React Router v6 and Axios.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100">Node & Express</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modular controllers, routes, and middleware with CORS & global error handling.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100">Mongoose ODM</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Schema definition with validation in `server/models/` ready for MongoDB integration.
          </p>
        </div>
      </section>
    </div>
  );
};
