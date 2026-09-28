import React, { useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Send, Wallet, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

export const TransferView = ({ onTransferSuccess }) => {
  const { user, refreshUserData } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mainBal = user?.mainBalance ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (!recipient.trim()) {
      setErrorMsg('Please enter recipient username or email.');
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount greater than 0.');
      return;
    }

    if (numAmount > mainBal) {
      setErrorMsg(`Insufficient main balance. You have $${mainBal.toFixed(2)} USD available.`);
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/api/user/transfer', {
        recipientUsername: recipient.trim(),
        amount: numAmount,
      });

      const message = res.data?.message || `Successfully transferred $${numAmount.toFixed(2)} USD to ${recipient}!`;
      setToastMsg(message);
      setRecipient('');
      setAmount('');

      if (refreshUserData) {
        await refreshUserData();
      }

      if (onTransferSuccess) {
        onTransferSuccess();
      }
    } catch (err) {
      const backendErr = err.response?.data?.error || err.response?.data?.message || err.message || 'Transfer failed.';
      setErrorMsg(backendErr);
    } finally {
      setLoading(false);
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

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-purple-900/30 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Send className="w-8 h-8 text-[#FF5A1F]" />
              <span>Balance Transfer</span>
            </h1>
            <p className="text-xs text-[#A397C7] mt-1">
              Transfer funds instantly to any registered Global Profit Hub investor account.
            </p>
          </div>
          <div className="bg-[#140838] border border-purple-800/40 rounded-2xl px-5 py-3 text-right">
            <span className="text-[10px] uppercase font-bold text-[#A397C7] block">Available Main Balance</span>
            <span className="text-xl font-black text-[#FF5A1F]">${mainBal.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Transfer Form Container */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-purple-900/30 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Recipient & Transfer Details</h2>
              <p className="text-xs text-[#A397C7]">Funds are debited from your main wallet and credited immediately.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Username / Email */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                Recipient Username / Email <span className="text-[#FF5A1F]">*</span>
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient's username or registered email address"
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/30 font-mono focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>

            {/* Transfer Amount */}
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                Transfer Amount (USD) <span className="text-[#FF5A1F]">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-4 pr-16 py-3 bg-[#0B0326] border-2 border-[#FF5A1F] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
                />
                <div className="absolute right-0 top-0 bottom-0 px-4 bg-[#FF5A1F] text-white font-black text-xs flex items-center rounded-r-xl uppercase">
                  USD
                </div>
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-sm tracking-widest uppercase shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Transfer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>TRANSFER FUNDS NOW</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferView;
