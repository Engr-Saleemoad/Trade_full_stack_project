import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { RefreshCw, Award } from 'lucide-react';

export const Plan = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get('/api/plans');
        setPlans(res.data.plans || []);
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] text-[10px] font-black tracking-widest uppercase shadow-md shadow-[#FF5A1F]/10">
            INVEST OFFER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Investment Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#A397C7] leading-relaxed">
            Choose from our high-yield algorithmic cryptocurrency investment packages.
          </p>
        </div>

        {/* Live Plans Grid / Loading / Fallback */}
        {loading ? (
          <div className="py-20 text-center text-[#A397C7] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F] mx-auto" />
            <p className="text-sm font-semibold">Loading investment plans...</p>
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
                {/* Diagonal Ribbon Badge */}
                <div className="absolute top-4 -right-10 bg-[#FF5A1F] text-white text-[10px] font-black tracking-wider px-10 py-1 rotate-45 shadow-md uppercase pointer-events-none">
                  {plan.badgeTag || `${plan.dailyReturnPercentage || 5}% Daily`}
                </div>

                {/* Card Info */}
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

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>Daily Return: <strong className="text-white">{plan.dailyReturnPercentage || 5}%</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-[#FF5A1F] font-bold text-sm">{'>'}</span>
                      <span>Frequency: <strong className="text-white">{plan.frequency || 'Every 24 Hours'}</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onSelectPlan && onSelectPlan(plan)}
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
    </div>
  );
};

export default Plan;
