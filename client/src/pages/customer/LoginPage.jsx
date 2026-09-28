import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUserApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Lock, Mail, Shield, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginUserApi({
        email: email.trim(),
        password,
      });

      if (response.token) {
        login(response.token, response.user || response.data);
      }

      setSuccessMsg(response.message || 'Authentication successful!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('[Customer Login Error]:', err);
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Network Error: Cannot connect to API server. Ensure backend server is running.'
          : err.message || 'Authentication failed. Invalid credentials.');
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0326] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5A1F]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center space-x-2 text-xs font-semibold text-[#A397C7] hover:text-[#FF5A1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Global Profit Hub</span>
        </Link>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Top Orange Shield Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Member Login</h1>
          <p className="text-xs text-[#A397C7]">Access your Global Profit Hub investment portfolio</p>
        </div>

        {/* Dynamic Error Message Block Container */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start space-x-3 text-xs font-medium shadow-lg shadow-rose-950/40 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-rose-100">Access Restricted</p>
              <p className="text-rose-200/90 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input 1: Email or Account ID */}
          <div>
            <label className="block text-xs font-semibold text-[#A397C7] mb-1.5">Email or Account ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@globalprofithub.com or john"
                className="w-full pl-10 pr-4 py-3 bg-[#0B0326]/80 border border-purple-800/40 rounded-xl text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>
          </div>

          {/* Input 2: Password */}
          <div>
            <label className="block text-xs font-semibold text-[#A397C7] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#0B0326]/80 border border-purple-800/40 rounded-xl text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors"
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

          {/* Utility Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-[#A397C7]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0B0326] border-purple-800 text-[#FF5A1F] focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[#FF5A1F] font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#FF5A1F]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Log In To Dashboard'}
            </button>
          </div>
        </form>

        {/* Bottom Footer Text */}
        <div className="mt-8 text-center border-t border-purple-900/30 pt-6">
          <p className="text-xs text-[#A397C7]">
            Don't have an investment account yet?{' '}
            <Link to="/register" className="text-[#FF5A1F] font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
