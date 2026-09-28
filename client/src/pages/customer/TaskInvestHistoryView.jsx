import React, { useState, useEffect } from 'react';
import { fetchActiveInvestmentsApi, claimInvestRewardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, Zap, Award } from 'lucide-react';

export const TaskInvestHistoryView = ({ onBuyPlanClick, onRewardClaimed }) => {
  const { refreshUserData } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Ticking state for interval re-renders
  const [nowTime, setNowTime] = useState(Date.now());

  const loadActiveInvestments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchActiveInvestmentsApi();
      const plansList = res.plans || res.data || [];
      setInvestments(Array.isArray(plansList) ? plansList : []);
    } catch (err) {
      console.warn('[Invest History] Error loading active plans:', err.message);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveInvestments();

    // 1-second interval timer tick
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = async (invId) => {
    setClaimingId(invId);
    setToastMsg('');
    setErrorMsg('');

    try {
      const res = await claimInvestRewardApi(invId);
      const msg = res.message || 'Successfully claimed interest reward!';
      setToastMsg(msg);

      if (refreshUserData) {
        await refreshUserData();
      }

      if (onRewardClaimed && res.updatedInterestBalance !== undefined) {
        onRewardClaimed(res.updatedInterestBalance);
      }

      await loadActiveInvestments();
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Claim failed.';
      setErrorMsg(message);
    } finally {
      setClaimingId(null);
    }
  };

  // Helper to format ticking countdown string & compute dynamic progress bar
  const getTimeRemaining = (nextTs, startTs) => {
    const nextMs = new Date(nextTs || Date.now()).getTime();
    const totalMs = nextMs - nowTime;

    if (totalMs <= 0) return { expired: true, text: '0d: 00h 00m 00s', percentProgress: 100 };

    const totalSecs = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSecs / (3600 * 24));
    const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = Math.floor(totalSecs % 60);

    const pad = (n) => String(n).padStart(2, '0');
    const text = `${days}d: ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    let percentProgress = 50;
    if (startTs) {
      const startMs = new Date(startTs).getTime();
      const totalDuration = nextMs - startMs;
      if (totalDuration > 0) {
        const elapsedMs = nowTime - startMs;
        percentProgress = Math.min(100, Math.max(0, (elapsedMs / totalDuration) * 100));
      }
    } else {
      const elapsedSecs = 86400 - totalSecs;
      percentProgress = Math.min(100, Math.max(0, (elapsedSecs / 86400) * 100));
    }

    return { expired: false, text, percentProgress };
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* ------------------- SECTION HEADER ------------------- */}
        <div className="border-b border-purple-900/30 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Invest History & Tasks</h1>
            <p className="text-xs text-[#A397C7] mt-1">Track active investment timers and claim your daily interest rewards.</p>
          </div>

          <button
            onClick={loadActiveInvestments}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tasks</span>
          </button>
        </div>

        {/* Dynamic Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ------------------- INVESTMENT TRACKING DATA GRID ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#FF5A1F] text-white font-black uppercase text-xs tracking-wider border-b border-[#FF5A1F]">
                <tr>
                  <th className="px-6 py-4">SL</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Return Interest</th>
                  <th className="px-6 py-4">Received Amount</th>
                  <th className="px-6 py-4 text-center">Upcoming Payment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-900/30 bg-[#130833]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#A397C7]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F] mx-auto mb-2" />
                      <span>Loading active investment plans...</span>
                    </td>
                  </tr>
                ) : investments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#A397C7]">
                      <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="font-semibold text-white">No active investment packages found.</p>
                      <p className="text-xs text-purple-300 mt-1">Invest in a package from the Plan tab to start generating daily yields.</p>
                    </td>
                  </tr>
                ) : (
                  investments.map((inv, idx) => {
                    const targetTs = inv.nextPayoutTimestamp || inv.nextClaimTime;
                    const startTs = inv.dynamicTimerStartTimestamp || inv.createdAt;
                    const timerInfo = getTimeRemaining(targetTs, startTs);

                    const claims = inv.totalClaimsProcessed || 0;
                    const payoutPerDay = Number(
                      inv.calculatedDailyPayout ||
                      inv.dailyReturnAmount ||
                      ((inv.price || inv.investmentAmount || 20) * (inv.dailyReturnPercentage || inv.profitPercentage || 5)) / 100
                    );
                    const totalReceived = (claims * payoutPerDay).toFixed(2);

                    return (
                      <tr key={inv._id} className="hover:bg-purple-950/40 transition-colors">
                        {/* SL */}
                        <td className="px-6 py-5 font-mono font-extrabold text-white">
                          {idx + 1}
                        </td>

                        {/* Plan */}
                        <td className="px-6 py-5 space-y-1">
                          <p className="font-bold text-white text-xs">{inv.planName}</p>
                          <p className="font-mono text-[11px] text-[#A397C7]">
                            ${inv.price || inv.investmentAmount || 20} USD
                          </p>
                        </td>

                        {/* Return Interest */}
                        <td className="px-6 py-5 font-bold text-emerald-400">
                          ${payoutPerDay.toFixed(2)} USD Per Cycle
                        </td>

                        {/* Received Amount */}
                        <td className="px-6 py-5 font-mono font-bold text-amber-300">
                          {claims} X ${payoutPerDay.toFixed(2)} = ${totalReceived} USD
                        </td>

                        {/* Upcoming Payment Countdown / Claim Button */}
                        <td className="px-6 py-5 text-center">
                          {timerInfo.expired ? (
                            /* Countdown reached 0: Glowing Orange CLAIM INTEREST Button */
                            <button
                              disabled={claimingId === inv._id}
                              onClick={() => handleClaim(inv._id)}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-amber-500 hover:from-[#e04c15] hover:to-amber-600 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer animate-pulse"
                            >
                              {claimingId === inv._id ? 'Claiming...' : 'CLAIM INTEREST'}
                            </button>
                          ) : (
                            /* Ticking Countdown Array String with Dynamic Line Progress Bar */
                            <div className="space-y-2 max-w-[200px] mx-auto">
                              <div className="font-mono text-xs font-black text-[#FF5A1F] tracking-wide flex items-center justify-center space-x-1.5 bg-[#0B0326] px-3 py-1.5 rounded-xl border border-purple-800/40">
                                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{timerInfo.text}</span>
                              </div>

                              {/* Progress Line Bar */}
                              <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden border border-purple-900/60">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF5A1F] to-emerald-400 transition-all duration-1000"
                                  style={{ width: `${timerInfo.percentProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
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
    </div>
  );
};

export default TaskInvestHistoryView;
