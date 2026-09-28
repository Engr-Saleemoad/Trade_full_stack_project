import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Share2,
  Percent,
  Sliders,
  History,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Check,
  TrendingUp,
  Layers,
  Zap,
  Users,
  Award,
  AlertCircle,
} from 'lucide-react';

export const AdminReferral = () => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'logs'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Commission Settings State
  const [settingsForm, setSettingsForm] = useState({
    level1: '5',
    level2: '2',
    level3: '1',
    triggerType: 'On Plan Purchase',
  });

  // Logs & History State
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Referral Settings & Logs
  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/referrals', getAuthHeaders());
      if (response.data) {
        // Set Settings
        if (response.data.settings) {
          const s = response.data.settings;
          const levels = s.levels || [];
          const l1 = levels.find((item) => item.levelNumber === 1)?.percentage ?? 5;
          const l2 = levels.find((item) => item.levelNumber === 2)?.percentage ?? 2;
          const l3 = levels.find((item) => item.levelNumber === 3)?.percentage ?? 1;

          setSettingsForm({
            level1: l1.toString(),
            level2: l2.toString(),
            level3: l3.toString(),
            triggerType: s.triggerType || 'On Plan Purchase',
          });
        }

        // Set Logs
        if (response.data.logs) {
          setLogs(response.data.logs);
        }
      }
    } catch (error) {
      console.error('[Admin Referral View] Error fetching data:', error);
      // Fallback dev state
      setSettingsForm({
        level1: '5',
        level2: '2',
        level3: '1',
        triggerType: 'On Plan Purchase',
      });
      setLogs([
        {
          _id: 'log_comm_001',
          referrerUsername: 'john',
          referredUsername: 'lucagracia',
          tierLevel: 1,
          commissionAmount: 2.5,
          sourceTransactionAmount: 50.0,
          triggerEvent: 'Plan Purchase ($50.00)',
          createdAt: new Date('2026-07-19T14:30:00Z').toISOString(),
        },
        {
          _id: 'log_comm_002',
          referrerUsername: 'john',
          referredUsername: 'sarah_c',
          tierLevel: 1,
          commissionAmount: 5.0,
          sourceTransactionAmount: 100.0,
          triggerEvent: 'Deposit Approval ($100.00)',
          createdAt: new Date('2026-07-18T11:20:00Z').toISOString(),
        },
        {
          _id: 'log_comm_003',
          referrerUsername: 'lucagracia',
          referredUsername: 'sarah_c',
          tierLevel: 2,
          commissionAmount: 2.0,
          sourceTransactionAmount: 100.0,
          triggerEvent: 'Deposit Approval ($100.00)',
          createdAt: new Date('2026-07-18T11:20:00Z').toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  // Update Settings Form Handler
  const handleUpdateSettings = async (e) => {
    e.preventDefault();

    const l1 = Number(settingsForm.level1);
    const l2 = Number(settingsForm.level2);
    const l3 = Number(settingsForm.level3);

    if (isNaN(l1) || l1 < 0 || isNaN(l2) || l2 < 0 || isNaN(l3) || l3 < 0) {
      showToast('Commission percentages must be non-negative numbers.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.put(
        '/api/admin/referrals/settings',
        {
          level1: l1,
          level2: l2,
          level3: l3,
          triggerType: settingsForm.triggerType,
        },
        getAuthHeaders()
      );

      const msg = res.data?.message || 'Commission tiers updated successfully!';
      showToast(msg, 'success');
    } catch (error) {
      console.error('[Admin Save Referral Settings Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to update commission settings.';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logs by search term
  const filteredLogs = logs.filter((item) => {
    const referrer = item.referrerUsername || '';
    const referred = item.referredUsername || '';

    return (
      referrer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referred.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-white bg-[#07021A] min-h-screen">
      {/* ------------------- TOAST NOTIFICATION ------------------- */}
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
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------- 1. HEADER SECTION ------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B0326] via-[#140838] to-[#0B0326] p-6 rounded-3xl border border-purple-900/40 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/30">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Referral & Commission Control
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Configure multi-level affiliate commission rates and track network rewards.
          </p>
        </div>

        <button
          onClick={fetchReferralData}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. TWO-TAB NAVIGATION BAR ------------------- */}
      <div className="flex items-center bg-[#0B0326] p-1.5 rounded-2xl border border-purple-900/40 w-fit">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-[#FF5A1F] to-amber-600 text-white shadow-lg shadow-[#FF5A1F]/20'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Commission Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-[#FF5A1F] to-amber-600 text-white shadow-lg shadow-[#FF5A1F]/20'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Referral Tree Logs</span>
        </button>
      </div>

      {/* ------------------- TAB 1: DYNAMIC MULTI-LEVEL COMMISSION SETTINGS ------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-[#0B0326] rounded-3xl border border-purple-900/40 p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="border-b border-purple-900/40 pb-4">
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#FF5A1F]" />
              <span>Commission Tiers Configuration</span>
            </h2>
            <p className="text-xs text-purple-400 mt-1">
              Define multi-level payout percentages distributed to referrers upon trigger events.
            </p>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-6">
            {/* Control Grid for Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Level 1 Commission */}
              <div className="bg-[#07021A] p-5 rounded-2xl border border-purple-800/40 space-y-3 shadow-md relative group hover:border-[#FF5A1F]/60 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Tier 1 (Direct)
                  </span>
                  <Percent className="w-4 h-4 text-[#FF5A1F]" />
                </div>
                <label className="block text-xs font-bold text-white">
                  Level 1 Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={settingsForm.level1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, level1: e.target.value })}
                    className="w-full p-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-white font-bold placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-400">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-purple-400">
                  Earned by direct sponsor when referred user completes transaction.
                </p>
              </div>

              {/* Level 2 Commission */}
              <div className="bg-[#07021A] p-5 rounded-2xl border border-purple-800/40 space-y-3 shadow-md relative group hover:border-[#FF5A1F]/60 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier 2 (Indirect)
                  </span>
                  <Percent className="w-4 h-4 text-[#FF5A1F]" />
                </div>
                <label className="block text-xs font-bold text-white">
                  Level 2 Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={settingsForm.level2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, level2: e.target.value })}
                    className="w-full p-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-white font-bold placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-cyan-400">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-purple-400">
                  Earned by 2nd-line parent upline in referral tree hierarchy.
                </p>
              </div>

              {/* Level 3 Commission */}
              <div className="bg-[#07021A] p-5 rounded-2xl border border-purple-800/40 space-y-3 shadow-md relative group hover:border-[#FF5A1F]/60 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Tier 3 (Network)
                  </span>
                  <Percent className="w-4 h-4 text-[#FF5A1F]" />
                </div>
                <label className="block text-xs font-bold text-white">
                  Level 3 Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={settingsForm.level3}
                    onChange={(e) => setSettingsForm({ ...settingsForm, level3: e.target.value })}
                    className="w-full p-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-white font-bold placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-amber-400">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-purple-400">
                  Earned by 3rd-line grandparent upline in referral tree hierarchy.
                </p>
              </div>
            </div>

            {/* Commission Trigger Rules Dropdown */}
            <div className="bg-[#07021A] p-5 rounded-2xl border border-purple-800/40 space-y-2 max-w-xl">
              <label className="block text-xs font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#FF5A1F]" />
                <span>Commission Trigger Event</span>
              </label>
              <select
                value={settingsForm.triggerType}
                onChange={(e) => setSettingsForm({ ...settingsForm, triggerType: e.target.value })}
                className="w-full p-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
              >
                <option value="On Plan Purchase">On Plan Purchase (When user buys investment package)</option>
                <option value="On User Deposit">On User Deposit (When admin approves pending deposit)</option>
              </select>
              <p className="text-[10px] text-purple-400">
                Specifies when the referral payout distribution engine calculates and credits bonuses.
              </p>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:from-amber-600 hover:to-[#FF5A1F] text-xs font-bold text-white transition-all shadow-xl shadow-[#FF5A1F]/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Update Commission Rules</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- TAB 2: REFERRAL LOGS & COMMISSION HISTORY TABLE ------------------- */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                placeholder="Search by Referrer or Referred Username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A397C7]">
                <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Referrer</th>
                    <th className="py-4 px-5">Referred User</th>
                    <th className="py-4 px-5">Level</th>
                    <th className="py-4 px-5">Trigger Event</th>
                    <th className="py-4 px-5">Commission Earned</th>
                    <th className="py-4 px-5">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-purple-900/20 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-purple-300">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                          <p className="text-xs">Loading commission history logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-purple-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <History className="w-8 h-8 text-purple-500/50" />
                          <p className="text-xs font-semibold">No commission logs recorded yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((item) => {
                      const levelNum = item.tierLevel || 1;
                      const dateStr = item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : 'Jul 2026';

                      return (
                        <tr key={item._id} className="hover:bg-purple-950/30 transition-colors">
                          {/* Referrer */}
                          <td className="py-4 px-5">
                            <span className="font-black text-white">
                              @{item.referrerUsername || 'john'}
                            </span>
                          </td>

                          {/* Referred User */}
                          <td className="py-4 px-5">
                            <span className="font-semibold text-purple-300">
                              @{item.referredUsername || 'lucagracia'}
                            </span>
                          </td>

                          {/* Level Badge */}
                          <td className="py-4 px-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                                levelNum === 1
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : levelNum === 2
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              Level {levelNum}
                            </span>
                          </td>

                          {/* Trigger Event */}
                          <td className="py-4 px-5 text-purple-200">
                            {item.triggerEvent || 'Plan Purchase ($40.00)'}
                          </td>

                          {/* Commission Earned */}
                          <td className="py-4 px-5 font-black text-[#FF5A1F] text-sm">
                            +${Number(item.commissionAmount || 0).toFixed(2)} USD
                          </td>

                          {/* Date */}
                          <td className="py-4 px-5 text-purple-400 text-[11px]">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferral;
