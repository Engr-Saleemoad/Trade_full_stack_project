import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { purchasePlanApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Zap, CheckCircle2, Shield, Lock, RefreshCw, Award, AlertCircle, X, DollarSign } from 'lucide-react';

export const InvestmentPlansView = ({ onSelectPlan }) => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Purchase Modal State
  const [purchasingPlan, setPurchasingPlan] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mainBal = Number(user?.mainBalance ?? 0);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await API.get('/api/plans');
        setPlans(res.data.plans || res.data.data || []);
      } catch (err) {
        console.error("Error loading plans:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleInvestClick = (plan) => {
    setPurchasingPlan(plan);
    setErrorMsg('');
  };

  const handleConfirmPurchase = async () => {
    if (!purchasingPlan) return;
    const planPrice = Number(purchasingPlan.price || 0);

    if (mainBal < planPrice) {
      setErrorMsg(`Insufficient main balance. You have $${mainBal.toFixed(2)} USD available, but this plan costs $${planPrice.toFixed(2)} USD.`);
      return;
    }

    setPurchasing(true);
    setErrorMsg('');

    try {
      const res = await purchasePlanApi({
        planId: purchasingPlan._id,
        planName: purchasingPlan.name,
        price: planPrice,
        dailyReturnPercentage: purchasingPlan.dailyReturnPercentage || 5,
      });

      const message = res.message || `Successfully purchased ${purchasingPlan.name}!`;
      setToastMsg(message);
      setPurchasingPlan(null);

      if (refreshUserData) {
        await refreshUserData();
      }

      // Switch view or navigate to Task tab
      setTimeout(() => {
        if (onSelectPlan) {
          onSelectPlan('Task');
        } else {
          navigate('/task');
        }
      }, 1200);
    } catch (err) {
      const backendErr = err.response?.data?.error || err.response?.data?.message || err.message || 'Plan purchase failed.';
      setErrorMsg(backendErr);
    } finally {
      setPurchasing(false);
    }
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

      <div className="max-w-6xl mx-auto space-y-12">
        {/* ------------------- HEADER SECTION ------------------- */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] text-[10px] font-black tracking-widest uppercase shadow-md shadow-[#FF5A1F]/10">
            INVEST OFFER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Investment Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#A397C7] leading-relaxed">
            Choose from our high-yield algorithmic cryptocurrency investment packages tailored for daily returns and maximum portfolio growth.
          </p>
        </div>

        {/* ------------------- LIVE PLANS RENDERING ------------------- */}
        {loading ? (
          <div className="py-20 text-center text-[#A397C7] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F] mx-auto" />
            <p className="text-sm font-semibold">Loading available investment plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-[#130833] border border-purple-900/40 rounded-3xl p-8 shadow-2xl">
            <Award className="w-12 h-12 text-purple-400 mx-auto" />
            <p className="text-sm font-semibold text-[#A397C7]">
              No investment packages currently available. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan._id || plan.id}
                className="bg-[#130833] border border-purple-900/40 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#FF5A1F]/50 transition-all group"
              >
                {/* Top-Right Diagonal Ribbon Badge */}
                <div className="absolute top-4 -right-10 bg-[#FF5A1F] text-white text-[10px] font-black tracking-wider px-10 py-1 rotate-45 shadow-md uppercase pointer-events-none">
                  {plan.badgeTag || `${plan.dailyReturnPercentage || 5}% Daily`}
                </div>

                {/* Card Header & Price */}
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-white pr-12">
                    {plan.name} {plan.tokenSymbol ? `(${plan.tokenSymbol})` : ''}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-[#FF5A1F]">${plan.price}</span>
                      <span className="text-xs text-[#A397C7]">USD</span>
                    </div>
                    <div className="h-px bg-purple-900/30 w-full my-3" />
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>
                        Daily Return: <strong className="text-white">{plan.dailyReturnPercentage || 5}%</strong>
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>
                        Frequency: <strong className="text-white">{plan.frequency || 'Configured Interval'}</strong>
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>
                        Capital Back: <strong className="text-emerald-400 font-bold">{plan.capitalBack !== false ? 'Yes' : 'No'}</strong>
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>
                        Status: <span className="px-2 py-0.5 rounded-full bg-purple-950 text-[10px] text-purple-300 border border-purple-800/40">Active Package</span>
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Action Button styled with Angled Cuts */}
                <div className="pt-6">
                  <button
                    onClick={() => handleInvestClick(plan)}
                    className="w-full py-3.5 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
                  >
                    INVEST NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------- PURCHASE CONFIRMATION MODAL ------------------- */}
      {purchasingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-900/60 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirm Investment</h3>
                  <p className="text-xs text-purple-300">{purchasingPlan.name}</p>
                </div>
              </div>

              <button
                onClick={() => setPurchasingPlan(null)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Balance Box */}
            <div className="bg-[#140838] border border-purple-800/40 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-purple-300">
                <span>Available Main Balance:</span>
                <span className="font-bold text-[#FF5A1F]">${mainBal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span>Package Investment Price:</span>
                <span className="font-bold text-white">${Number(purchasingPlan.price).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-emerald-300 pt-2 border-t border-purple-900/40 font-bold">
                <span>Estimated Daily Return:</span>
                <span className="text-emerald-400">
                  {purchasingPlan.dailyReturnPercentage || 5}% (${((Number(purchasingPlan.price) * (purchasingPlan.dailyReturnPercentage || 5)) / 100).toFixed(2)} USD)
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setPurchasingPlan(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 text-xs font-bold hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              {mainBal < Number(purchasingPlan.price) ? (
                <button
                  onClick={() => {
                    setPurchasingPlan(null);
                    if (onSelectPlan) onSelectPlan('Add Fund');
                    else navigate('/add-fund');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/30 transition cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Deposit Funds First</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-[#FF5A1F]/30 transition cursor-pointer"
                >
                  {purchasing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Purchasing...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Confirm & Invest</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPlansView;
