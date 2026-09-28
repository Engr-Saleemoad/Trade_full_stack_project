import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/api';
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address structure (e.g. investor@domain.com).');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPasswordApi(email.trim());
      setSuccessMsg(
        response.message ||
          'A dynamic password recovery instruction link has been processed to your email account successfully!'
      );
    } catch (err) {
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to process password recovery. Please check your email address.';
      setErrorMsg(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0426] via-[#0A031F] to-[#050112] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5A1F]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Return Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between z-10">
        <Link
          to="/login"
          className="flex items-center space-x-2 text-xs font-semibold text-[#A397C7] hover:text-[#FF5A1F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login Screen</span>
        </Link>
      </div>

      {/* Main Card Container with Orange Accent Line Layer */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 before:absolute before:top-0 before:left-8 before:w-20 before:h-1 before:bg-[#FF5A1F] before:rounded-full">
        
        {/* Key Icon & Header Typography */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password</h1>
          <p className="text-xs text-[#A397C7] leading-relaxed">
            Enter your registered email address to receive password reset security guidelines.
          </p>
        </div>



        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Green Toast / Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3 text-xs leading-relaxed">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Block: Email */}
          <div>
            <label className="block text-xs font-semibold text-[#A397C7] mb-2">Registered Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email Address"
                className="w-full pl-10 pr-4 py-3.5 bg-[#0B0326]/90 border border-purple-800/40 rounded-xl text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors font-sans"
              />
            </div>
          </div>

          {/* Primary Action Button: SEND RESET LINK with Angled Sharp Edges */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
            >
              {loading ? 'Processing...' : 'SEND RESET LINK'}
            </button>
          </div>
        </form>

        {/* Bottom Utility Row */}
        <div className="text-center border-t border-purple-900/30 pt-6">
          <Link
            to="/login"
            className="text-xs font-bold text-[#FF5A1F] hover:underline inline-flex items-center space-x-1"
          >
            <span>Back to Login Screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
