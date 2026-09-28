import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLoginApi } from '../../services/api';
import {
  ShieldAlert,
  Lock,
  Mail,
  Zap,
  Globe,
  Activity,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminLoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg('Please enter both administrative Email/Username and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await adminLoginApi({
        email: usernameOrEmail.trim(),
        username: usernameOrEmail.trim(),
        password,
      });

      if (response.token) {
        localStorage.setItem('adminToken', response.token);
      }
      if (response.user) {
        localStorage.setItem('adminUser', JSON.stringify(response.user));
      }

      setSuccessMsg(response.message || 'Administrative authentication successful.');

      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err) {
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Access denied. Invalid administrative credentials.';
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0426] via-[#0A031F] to-[#050112] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5A1F]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Dual-Panel Card Module (image_3e401f.png Layout) */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-[#140838]/90 to-[#0B0326]/90 border border-purple-900/40 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 md:grid-cols-2">
        
        {/* ------------------- LEFT PANEL: GRAPHIC ASSET (DARK ADAPTED) ------------------- */}
        <div className="bg-gradient-to-br from-[#1A0C48] to-[#0D0429] p-8 sm:p-10 border-b md:border-b-0 md:border-r border-purple-900/40 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Circuit Graphics */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Panel Brand */}
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">ADMIN CONTROL</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5A1F]">System Portal</span>
            </div>
          </div>

          {/* Center Graphic Dashboard Vector Illustration */}
          <div className="my-8 relative z-10 flex flex-col items-center justify-center space-y-6">
            <div className="w-full max-w-xs bg-[#0B0326]/80 border border-purple-800/40 rounded-2xl p-5 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#FF5A1F]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live System Health</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  99.9% ACTIVE
                </span>
              </div>

              {/* Graphic Mock Charts */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#A397C7]">
                    <span>Transaction Load</span>
                    <span className="text-white font-mono">1,420 Tx/s</span>
                  </div>
                  <div className="h-2 w-full bg-purple-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF5A1F] to-amber-500 rounded-full w-[78%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#A397C7]">
                    <span>MongoDB Nodes</span>
                    <span className="text-emerald-400 font-mono">Synced</span>
                  </div>
                  <div className="h-2 w-full bg-purple-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                  </div>
                </div>
              </div>

              {/* Mock Bar Chart Graphic Visualizer */}
              <div className="h-20 pt-2 flex items-end justify-between gap-1.5 border-t border-purple-900/30">
                <div className="w-full bg-purple-900/40 rounded-t h-[40%]" />
                <div className="w-full bg-purple-900/40 rounded-t h-[65%]" />
                <div className="w-full bg-[#FF5A1F] rounded-t h-[90%] shadow-lg shadow-[#FF5A1F]/40" />
                <div className="w-full bg-purple-900/40 rounded-t h-[50%]" />
                <div className="w-full bg-amber-500 rounded-t h-[75%]" />
                <div className="w-full bg-purple-900/40 rounded-t h-[60%]" />
                <div className="w-full bg-emerald-500 rounded-t h-[100%]" />
              </div>
            </div>

            <p className="text-xs text-center text-[#A397C7] max-w-xs font-medium leading-relaxed">
              Global Profit Hub Administrative Dashboard Management & Security Center.
            </p>
          </div>

          {/* Bottom Security Badge */}
          <div className="flex items-center justify-between text-[11px] text-[#A397C7] pt-4 border-t border-purple-900/40 z-10 font-mono">
            <span>Encrypted Session</span>
            <span className="text-emerald-400 font-bold">JWT 256-Bit</span>
          </div>
        </div>

        {/* ------------------- RIGHT PANEL: FORM ACTION PANEL ------------------- */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            {/* Top Logo & Header */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-md">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-sm font-black tracking-tight text-white">
                  GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#FF5A1F]">Admin Portal Login</h2>
                <p className="text-xs text-[#A397C7]">Authorized administrative credentials required for system access</p>
              </div>
            </div>

            {/* Dynamic Error Alert */}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3 text-xs leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Controls */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input 1: Email Or Username */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2">Email Or Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin or admin@globalprofithub.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-[#0B0326]/90 border border-purple-800/40 rounded-xl text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* Input 2: Password */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3.5 bg-[#0B0326]/90 border border-purple-800/40 rounded-xl text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Action Button: Sign In with Angled Sharp Cuts */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
                >
                  {loading ? 'Authenticating Admin...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Return Option (No Forgot Password link for Admin) */}
          <div className="text-center border-t border-purple-900/30 pt-4 flex items-center justify-center text-xs">
            <Link to="/login" className="text-[#A397C7] hover:text-[#FF5A1F] font-semibold transition-colors">
              Return to Customer Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
