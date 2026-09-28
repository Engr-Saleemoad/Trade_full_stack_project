import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';

export const PayoutModal = ({ isOpen, onClose, selectedGateway, onNext }) => {
  const { user } = useAuth();
  const mainBal = user?.mainBalance ?? 0;
  const interestBal = user?.interestBalance ?? 0;

  const [selectedWallet, setSelectedWallet] = useState(`Deposit Balance - $${mainBal.toFixed(2)}`);
  const [amount, setAmount] = useState('40');
  const [amountError, setAmountError] = useState('');

  if (!isOpen || !selectedGateway) return null;

  const handleSubmit = (e) => {
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

    if (onNext) {
      onNext({ selectedWallet, amount: numAmount });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#130833] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <h2 className="text-base font-bold text-white tracking-tight pr-6">
            {selectedGateway.title || selectedGateway.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-[#A397C7]">
            Transaction Limit:{' '}
            <strong className="text-white font-semibold">
              {selectedGateway.minLimit} - {selectedGateway.maxLimit} $
            </strong>
          </p>

          <p className="text-xs text-[#A397C7]">
            Charge:{' '}
            <strong className="text-emerald-400 font-semibold">
              {selectedGateway.fixedFee || 0} $ + {selectedGateway.percentFee || 0} %
            </strong>
          </p>

          {amountError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{amountError}</span>
            </div>
          )}

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
  );
};

export default PayoutModal;
