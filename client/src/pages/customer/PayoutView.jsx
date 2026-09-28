import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPayoutApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle, CheckCircle2, ArrowRight, Wallet, DollarSign, Shield, Zap } from 'lucide-react';

export const PayoutView = ({ onNavigateToHistory }) => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();

  const mainBal = user?.mainBalance ?? 0;
  const interestBal = user?.interestBalance ?? 0;

  // Steps: 1: Gateway Cards, 2: Configuration Modal, 3: Payout Form Review
  const [step, setStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedWallet, setSelectedWallet] = useState(`Deposit Balance - $${mainBal.toFixed(2)}`);
  const [amount, setAmount] = useState('40');
  const [walletAddress, setWalletAddress] = useState('');

  const [amountError, setAmountError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const gateways = [
    {
      id: 'usdt_bep20',
      name: 'USDT BEP20',
      title: 'Payout By USDT ( BP 20 )',
      network: 'BEP 20 (Binance Smart Chain)',
      minLimit: 10,
      maxLimit: 500,
      fixedFee: 0,
      percentFee: 10,
      gradient: 'from-[#140838] via-emerald-950/40 to-[#0B0326]',
      borderColor: 'border-emerald-500/30',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'usdt_trc20',
      name: 'USDT TRC20',
      title: 'Payout By USDT ( TRC 20 )',
      network: 'TRC 20 (Tron Network)',
      minLimit: 10,
      maxLimit: 500,
      fixedFee: 0,
      percentFee: 10,
      gradient: 'from-[#140838] via-[#FF5A1F]/10 to-[#0B0326]',
      borderColor: 'border-[#FF5A1F]/30',
      tagColor: 'bg-[#FF5A1F]/10 text-[#FF5A1F] border-[#FF5A1F]/20',
    },
  ];

  const handlePayoutNowClick = (gw) => {
    setSelectedGateway(gw);
    setAmount('40');
    setAmountError('');
    setIsModalOpen(true);
  };

  const handleModalNext = (e) => {
    e.preventDefault();
    setAmountError('');

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      setAmountError('Please enter a valid numeric amount.');
      return;
    }

    if (numAmount < selectedGateway.minLimit || numAmount > selectedGateway.maxLimit) {
      setAmountError(
        `Withdrawal amount must be strictly between ${selectedGateway.minLimit} and ${selectedGateway.maxLimit} USD.`
      );
      return;
    }

    setIsModalOpen(false);
    setStep(3); // Progress to Step 3: Payout Form Review
  };

  // Step 3 Math Calculations
  const reqAmountNum = Number(amount) || 40;
  const chargeAmount = Number((reqAmountNum * 0.1).toFixed(2));
  const totalPayable = Number((reqAmountNum + chargeAmount).toFixed(2));
  const selectedBalNum = selectedWallet.includes('Interest') ? interestBal : mainBal;
  const availableBal = Math.max(0, Number((selectedBalNum - totalPayable).toFixed(2)));

  const handleConfirmNow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (!walletAddress || !walletAddress.trim()) {
      setErrorMsg('Wallet Address is mandatory.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await requestPayoutApi({
        selectedWallet,
        gatewayType: selectedGateway?.name || 'USDT BEP20',
        rawAmount: reqAmountNum,
        recipientWalletAddress: walletAddress.trim(),
      });

      const message =
        response.message || 'Your request has been successfully submitted! Admin will review it shortly.';
      setToastMsg(message);

      if (refreshUserData) {
        await refreshUserData();
      }

      setTimeout(() => {
        if (onNavigateToHistory) {
          onNavigateToHistory();
        } else {
          navigate('/payout-history');
        }
      }, 1800);
    } catch (err) {
      const backendErr =
        err.response?.data?.message || err.response?.data?.error || err.message || 'Payout request failed.';
      setErrorMsg(backendErr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white relative">
      {/* Dynamic Toast Success Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* ------------------- STEP 1 & 2: PAYOUT MONEY GATEWAYS (image_3abace.jpg) ------------------- */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="border-b border-purple-900/30 pb-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Payout Money</h1>
              <p className="text-xs text-[#A397C7] mt-1">Select your preferred cryptocurrency gateway to withdraw earnings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gateways.map((gw) => (
                <div
                  key={gw.id}
                  className={`bg-gradient-to-b ${gw.gradient} border ${gw.borderColor} rounded-3xl p-8 shadow-xl text-center space-y-6 flex flex-col justify-between hover:border-[#FF5A1F]/50 transition-all group`}
                >
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-black/40 border border-purple-800/40 p-4 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-emerald-400 flex items-center justify-center font-black text-white text-lg shadow-md">
                        ₮
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${gw.tagColor}`}>
                        {gw.network}
                      </span>
                      <h2 className="text-2xl font-black text-white tracking-tight">{gw.name}</h2>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/30 border border-purple-900/30 text-xs text-[#A397C7] space-y-1">
                      <p className="flex justify-between">
                        <span>Transaction Limit:</span>
                        <strong className="text-white">{gw.minLimit} - {gw.maxLimit} USD</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Charge:</span>
                        <strong className="text-emerald-400">{gw.fixedFee} USD + {gw.percentFee}%</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => handlePayoutNowClick(gw)}
                      className="w-full py-4 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]"
                    >
                      PAYOUT NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------- STEP 2: CONFIGURATION MODAL OVERLAY (image_3abbac.png) ------------------- */}
        {isModalOpen && selectedGateway && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-[#130833] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Modal Header Title with 'X' Close Indicator */}
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
                <h2 className="text-base font-bold text-white tracking-tight pr-6">
                  {selectedGateway.title}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModalNext} className="space-y-5">
                {/* Line 1: Transaction Limits */}
                <p className="text-xs text-[#A397C7]">
                  Transaction Limit: <strong className="text-white font-semibold">{selectedGateway.minLimit} - {selectedGateway.maxLimit} $</strong>
                </p>

                {/* Line 2: Fee Structure */}
                <p className="text-xs text-[#A397C7]">
                  Charge: <strong className="text-emerald-400 font-semibold">{selectedGateway.fixedFee} $ + {selectedGateway.percentFee} %</strong>
                </p>

                {/* Amount Limit Error Alert */}
                {amountError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{amountError}</span>
                  </div>
                )}

                {/* Dropdown Selection: Select Wallet */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2">Select Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/50 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <option value={`Deposit Balance - $${mainBal.toFixed(2)}`} className="bg-[#0B0326]">
                      Deposit Balance - ${mainBal.toFixed(2)}
                    </option>
                    <option value={`Interest Balance - $${interestBal.toFixed(2)}`} className="bg-[#0B0326]">
                      Interest Balance - ${interestBal.toFixed(2)}
                    </option>
                  </select>
                </div>

                {/* Input Field: Amount with Trailing Highlight Badge */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2">Amount</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={selectedGateway.minLimit}
                      max={selectedGateway.maxLimit}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="40"
                      className="w-full pl-4 pr-16 py-3 bg-[#0B0326] border-2 border-[#FF5A1F] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
                    />
                    <div className="absolute right-0 top-0 bottom-0 px-4 bg-[#FF5A1F] text-white font-black text-xs flex items-center rounded-r-xl uppercase">
                      USD
                    </div>
                  </div>
                </div>

                {/* Submit Action Button NEXT at Bottom Right */}
                <div className="flex justify-end pt-4 border-t border-purple-900/40">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
                  >
                    NEXT
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------- STEP 3: PAYOUT REVIEW & FORM EXECUTION (image_3abef0.jpg) ------------------- */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Payout Form</h1>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-purple-950 text-slate-300 hover:text-white text-xs font-bold border border-purple-800/40 transition-colors"
              >
                Back to Gateways
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Side Info Card: Orange Rectangular Summary Block Grid */}
              <div className="bg-[#FF5A1F] rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-100 border-b border-white/20 pb-3">
                  Withdrawal Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-90">Request Amount:</span>
                    <strong className="text-base font-black">{reqAmountNum} $</strong>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-90">Charge Amount (10%):</span>
                    <strong className="text-base font-black">{chargeAmount} $</strong>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="opacity-90">Total Payable:</span>
                    <strong className="text-xl font-black text-amber-200">{totalPayable} $</strong>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="opacity-90">Available Balance:</span>
                    <strong className="text-base font-black">{availableBal} $</strong>
                  </div>
                </div>
              </div>

              {/* Right Side Input Container */}
              <div className="lg:col-span-2 bg-[#130833] border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h2 className="text-base font-bold text-white border-b border-purple-900/30 pb-3">
                  Additional Information To Withdraw Confirm
                </h2>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmNow} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-white mb-2">
                      Wallet Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your destination USDT wallet address (e.g. 0x86A04560103588BFA89B478E09F6d89C0C858eEB)"
                      className="w-full p-4 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/30 font-mono focus:outline-none focus:border-[#FF5A1F] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-sm tracking-widest uppercase shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Processing Request...' : 'CONFIRM NOW'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
