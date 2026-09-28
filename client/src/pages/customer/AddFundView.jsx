import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Zap, DollarSign, Lock } from 'lucide-react';

export const AddFundView = ({ selectedPlan: propSelectedPlan }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected plan can come either via prop (dashboard tab navigation) or location state (direct route)
  const selectedPlan = propSelectedPlan || location.state?.selectedPlan || null;
  const isPriceLocked = Boolean(selectedPlan && selectedPlan.price);

  const [selectedGateway, setSelectedGateway] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(selectedPlan ? String(selectedPlan.price) : '100');
  const [amountError, setAmountError] = useState('');
  const [paymentStep, setPaymentStep] = useState(1);

  useEffect(() => {
    if (selectedPlan && selectedPlan.price) {
      setAmount(String(selectedPlan.price));
    }
  }, [selectedPlan]);

  const gateways = [
    {
      id: 'usdt_bep20',
      name: 'USDT BEP20',
      title: 'Payment By USDT ( BEP 20 ) - USDT',
      network: 'BEP 20 (Binance Smart Chain)',
      minLimit: 20,
      maxLimit: 10000,
      charge: 0,
      address: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
      gradient: 'from-[#140838] via-emerald-950/40 to-[#0B0326]',
      borderColor: 'border-emerald-500/30',
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'usdt_trc20',
      name: 'USDT TRC20',
      title: 'Payment By USDT ( TRC 20 ) - USDT',
      network: 'TRC 20 (Tron Network)',
      minLimit: 20,
      maxLimit: 10000,
      charge: 0,
      address: 'T9yD14Nj9j7xAB4dbGeiX9h8uu36B3h664',
      gradient: 'from-[#140838] via-[#FF5A1F]/10 to-[#0B0326]',
      borderColor: 'border-[#FF5A1F]/30',
      tagColor: 'bg-[#FF5A1F]/10 text-[#FF5A1F] border-[#FF5A1F]/20',
    },
  ];

  const handlePayNow = (gateway) => {
    setSelectedGateway(gateway);
    setAmount(selectedPlan ? String(selectedPlan.price) : '100');
    setAmountError('');
    setPaymentStep(1);
    setIsModalOpen(true);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setAmountError('');

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      setAmountError('Please enter a valid amount.');
      return;
    }

    if (!isPriceLocked) {
      if (numAmount < selectedGateway.minLimit || numAmount > selectedGateway.maxLimit) {
        setAmountError(
          `Amount must be between ${selectedGateway.minLimit} and ${selectedGateway.maxLimit} USD.`
        );
        return;
      }
    }

    setPaymentStep(2);
  };

  const handleProceedToVerification = () => {
    setIsModalOpen(false);
    navigate('/payment-verification', {
      state: {
        gatewayName: selectedGateway.name,
        amount,
        walletAddress: selectedGateway.address,
        planName: selectedPlan?.name || null,
      },
    });
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ------------------- SECTION HEADER ------------------- */}
        <div className="border-b border-purple-900/30 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Add Fund</h1>
            <p className="text-xs text-[#A397C7] mt-1">Select your preferred cryptocurrency gateway to deposit funds into your main balance.</p>
          </div>

          {/* Selected Plan Active Indicator Banner if redirected from Plan card */}
          {selectedPlan && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 shrink-0">
              <Lock className="w-4 h-4 text-[#FF5A1F]" />
              <div>
                <p className="font-bold text-white">Target Plan: {selectedPlan.name}</p>
                <p className="text-[11px] text-amber-200">Fixed Package Amount: <strong>${selectedPlan.price} USD</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* ------------------- DEPOSIT GATEWAY CARDS GRID (image_2d8163.jpg) ------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className={`bg-gradient-to-b ${gw.gradient} border ${gw.borderColor} rounded-3xl p-8 shadow-xl text-center space-y-6 flex flex-col justify-between hover:border-[#FF5A1F]/50 transition-all group`}
            >
              {/* Asset Graphic Banner */}
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
                    <strong className="text-white">
                      {isPriceLocked ? `${selectedPlan.price} USD (Plan Fixed)` : `${gw.minLimit} - ${gw.maxLimit} USD`}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Charge:</span>
                    <strong className="text-emerald-400">{gw.charge} USD</strong>
                  </p>
                </div>
              </div>

              {/* Prominent Orange Action Button Styled with Diagonal Cuts */}
              <div className="pt-4">
                <button
                  onClick={() => handlePayNow(gw)}
                  className="w-full py-4 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]"
                >
                  PAY NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ------------------- PAYMENT CONFIGURATION MODAL OVERLAY (image_2d81a5.png) ------------------- */}
        {isModalOpen && selectedGateway && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-[#130833] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Modal Header & 'X' Close Button */}
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

              {paymentStep === 1 ? (
                <form onSubmit={handleNext} className="space-y-5">
                  {/* Line 1: Transaction Limits */}
                  <p className="text-xs text-[#A397C7]">
                    Transaction Limit: <strong className="text-white font-semibold">{selectedGateway.minLimit} - {selectedGateway.maxLimit} $</strong>
                  </p>

                  {/* Line 2: Processing Fee */}
                  <p className="text-xs text-[#A397C7]">
                    Charge: <strong className="text-emerald-400 font-semibold">{selectedGateway.charge} $</strong>
                  </p>

                  {/* Selected Plan Fixed Price Notice Pill */}
                  {isPriceLocked && (
                    <div className="p-3 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-xs text-slate-200 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>
                        Package <strong className="text-white">{selectedPlan.name}</strong> selected. Amount is fixed to <strong className="text-[#FF5A1F]">${selectedPlan.price} USD</strong>.
                      </span>
                    </div>
                  )}

                  {/* Error Container */}
                  {amountError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{amountError}</span>
                    </div>
                  )}

                  {/* Line 3: Amount Input Field */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-2">Amount</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        readOnly={isPriceLocked}
                        disabled={isPriceLocked}
                        min={selectedGateway.minLimit}
                        max={selectedGateway.maxLimit}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className={`w-full pl-4 pr-16 py-3 bg-[#0B0326] border-2 border-[#FF5A1F] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all ${
                          isPriceLocked ? 'cursor-not-allowed opacity-80 bg-purple-950/40 border-purple-700' : ''
                        }`}
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
              ) : (
                /* Payment Confirmation Address Step 2 */
                <div className="space-y-5 text-xs">
                  <div className="p-4 rounded-2xl bg-[#0B0326] border border-purple-800/40 space-y-3">
                    {selectedPlan && (
                      <div className="flex justify-between text-[#A397C7]">
                        <span>Selected Package:</span>
                        <strong className="text-white">{selectedPlan.name}</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-[#A397C7]">
                      <span>Selected Gateway:</span>
                      <strong className="text-white">{selectedGateway.name}</strong>
                    </div>
                    <div className="flex justify-between text-[#A397C7]">
                      <span>Deposit Amount:</span>
                      <strong className="text-[#FF5A1F] text-sm">${amount} USD</strong>
                    </div>
                    <div className="flex justify-between text-[#A397C7]">
                      <span>Network Fee:</span>
                      <strong className="text-emerald-400">$0.00 USD</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Send Payment To Address ({selectedGateway.network}):
                    </span>
                    <p className="font-mono text-[11px] text-amber-300 break-all p-2.5 bg-black/60 rounded-xl border border-purple-900/60">
                      {selectedGateway.address}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setPaymentStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleProceedToVerification}
                      className="px-6 py-3 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Proceed To Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
