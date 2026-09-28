import React, { useState, useEffect } from 'react';
import { fetchAdminSettingsApi, updateAdminTimerSettingApi } from '../../services/api';
import {
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Zap,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export const AdminSettings = () => {
  const [timerMinutes, setTimerMinutes] = useState(1440);
  const [selectedMinutes, setSelectedMinutes] = useState(1440);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSettingsApi();
      const mins = Number(res.investmentIntervalMinutes || res.setting?.investmentIntervalMinutes || 1440);
      setTimerMinutes(mins);
      setSelectedMinutes(mins);
    } catch (err) {
      console.warn('[Admin Settings] Error fetching settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveTimerSetting = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateAdminTimerSettingApi(Number(selectedMinutes));
      const msg = res.message || `Investment claim timer updated to ${selectedMinutes} minute(s)!`;
      showToast(msg, 'success');
      setTimerMinutes(Number(selectedMinutes));
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update timer setting.';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white bg-[#07021A] min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl border font-semibold text-xs transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-500/20'
                : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B0326] via-[#140838] to-[#0B0326] p-6 rounded-3xl border border-purple-900/40 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/30">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">System Settings & Controls</h1>
          </div>
          <p className="text-xs text-[#A397C7]">Configure global platform parameters and claim timer speed for fast testing.</p>
        </div>

        <button
          onClick={loadSettings}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Settings</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Investment Claim Timer Duration Control */}
        <div className="bg-[#0B0326] border border-purple-900/30 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex items-center space-x-3 border-b border-purple-900/30 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Investment Claim Timer Duration</h2>
              <p className="text-xs text-[#A397C7]">Set the countdown interval for ROI interest claims.</p>
            </div>
          </div>

          {/* Current Status Indicator */}
          <div className="bg-[#140838] p-4 rounded-2xl border border-purple-800/40 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#A397C7]">Active Configured Timer:</span>
              <span className="font-bold text-[#FF5A1F] text-sm">
                {timerMinutes === 1
                  ? '1 Minute (Instant Test Mode)'
                  : timerMinutes === 2
                  ? '2 Minutes (Quick Test Mode)'
                  : timerMinutes === 30
                  ? '30 Minutes (Short Demo Mode)'
                  : `${timerMinutes} Minutes (${(timerMinutes / 60).toFixed(0)} Hours Standard)`}
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 italic">
              When investors purchase a plan or claim interest, their next payout timer will be set to this exact duration.
            </p>
          </div>

          <form onSubmit={handleSaveTimerSetting} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white">
                Select Claim Timer Speed:
              </label>
              <select
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                className="w-full p-3.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
              >
                <option value={1}>⚡ 1 Minute (Instant Testing / Fast Demo)</option>
                <option value={2}>⏱️ 2 Minutes (Quick Test Cycle)</option>
                <option value={30}>🕒 30 Minutes (Short Test Cycle)</option>
                <option value={1440}>📅 24 Hours (1440 Minutes - Standard Production)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/30 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Setting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Update Timer Setting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: Quick Information & Testing Helper */}
        <div className="bg-[#0B0326] border border-purple-900/30 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-purple-900/30 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Testing Instructions</h2>
                <p className="text-xs text-[#A397C7]">How to test investment claims instantly.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-purple-200">
              <div className="flex items-start space-x-3 bg-[#140838]/60 p-3.5 rounded-xl border border-purple-900/30">
                <span className="w-5 h-5 rounded-full bg-[#FF5A1F] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>Select <strong>"1 Minute"</strong> or <strong>"2 Minutes"</strong> in the timer control card and click <strong>Update Timer Setting</strong>.</p>
              </div>

              <div className="flex items-start space-x-3 bg-[#140838]/60 p-3.5 rounded-xl border border-purple-900/30">
                <span className="w-5 h-5 rounded-full bg-[#FF5A1F] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>Go to the Customer Portal $\rightarrow$ <strong>Plan</strong> tab and purchase any investment package.</p>
              </div>

              <div className="flex items-start space-x-3 bg-[#140838]/60 p-3.5 rounded-xl border border-purple-900/30">
                <span className="w-5 h-5 rounded-full bg-[#FF5A1F] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>Open the Customer <strong>Task</strong> tab. Watch the countdown timer tick down inside 60 seconds.</p>
              </div>

              <div className="flex items-start space-x-3 bg-[#140838]/60 p-3.5 rounded-xl border border-purple-900/30">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <p>Click the glowing <strong>CLAIM INTEREST</strong> button to instantly credit interest returns into your balance!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
