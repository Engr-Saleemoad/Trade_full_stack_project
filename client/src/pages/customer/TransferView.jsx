import React, { useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Wallet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Search,
  ShieldCheck,
  User,
  X,
  Clock,
} from 'lucide-react';

export const TransferView = ({ onTransferSuccess }) => {
  const { user, refreshUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingUser, setFetchingUser] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mainBal = user?.mainBalance ?? 0;

  // Step 1: Fetch Recipient Details from API
  const handleFetchRecipient = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    const query = searchQuery.trim();
    if (!query) {
      setErrorMsg('Please enter a username or email to lookup.');
      return;
    }

    setFetchingUser(true);
    setRecipientInfo(null);

    try {
      const res = await API.get('/api/user/lookup', {
        params: { query },
      });

      if (res.data && res.data.user) {
        setRecipientInfo(res.data.user);
      } else {
        setErrorMsg('Recipient user not found.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Recipient account not found.';
      setErrorMsg(msg);
    } finally {
      setFetchingUser(false);
    }
  };

  // Step 2: Submit Transfer Request for Admin Approval
  const handleSubmitTransferRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (!recipientInfo) {
      setErrorMsg('Please fetch and verify recipient details before submitting.');
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

    setSubmitting(true);

    try {
      const res = await API.post('/api/user/transfer-request', {
        recipientId: recipientInfo._id,
        recipientUsername: recipientInfo.username,
        amount: numAmount,
      });

      const message =
        res.data?.message ||
        'Transfer request submitted to admin for approval. Funds will be transferred once reviewed.';
      setToastMsg(message);
      setSearchQuery('');
      setRecipientInfo(null);
      setAmount('');

      if (refreshUserData) {
        await refreshUserData();
      }

      if (onTransferSuccess) {
        onTransferSuccess();
      }
    } catch (err) {
      const backendErr =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Transfer request failed.';
      setErrorMsg(backendErr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-4 sm:p-6 font-sans selection:bg-[#FF5A1F] selection:text-white relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-bounce max-w-sm sm:max-w-md">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-lg sm:max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="border-b border-purple-900/30 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Send className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF5A1F]" />
              <span>Peer-to-Peer Transfer Request</span>
            </h1>
            <p className="text-xs text-[#A397C7] mt-1">
              Submit an admin-governed P2P money transfer request to any registered Global Profit Hub investor.
            </p>
          </div>
          <div className="bg-[#140838] border border-purple-800/40 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-left sm:text-right w-full sm:w-auto shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#A397C7] block">Available Main Balance</span>
            <span className="text-lg sm:text-xl font-black text-[#FF5A1F]">${mainBal.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Transfer Form Container */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-3 border-b border-purple-900/30 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Step 1: Fetch Recipient Details</h2>
              <p className="text-xs text-[#A397C7]">Lookup user by username or email before setting transfer amount.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Lookup Form */}
          <form onSubmit={handleFetchRecipient} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white mb-2">
                Recipient Username / Email <span className="text-[#FF5A1F]">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter recipient's username or email (e.g. john)"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/30 font-mono focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={fetchingUser}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {fetchingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Fetch Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* STEP 1 PREVIEW CARD: Verified Recipient Card */}
          {recipientInfo && (
            <div className="bg-[#0B0326] border border-emerald-500/30 p-4 sm:p-5 rounded-2xl space-y-3 animate-fadeIn relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-[#FF5A1F] text-white font-black text-sm flex items-center justify-center border border-purple-500/30 shadow-md shrink-0">
                    {recipientInfo.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-white text-sm">{recipientInfo.fullName}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified User</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#FF5A1F] font-mono font-bold">@{recipientInfo.username}</p>
                    <p className="text-[11px] text-purple-300">{recipientInfo.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setRecipientInfo(null)}
                  className="self-end sm:self-center p-1.5 rounded-full bg-purple-950 text-purple-400 hover:text-white transition cursor-pointer"
                  title="Clear recipient"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Transfer Amount & Submission */}
          {recipientInfo && (
            <form onSubmit={handleSubmitTransferRequest} className="space-y-6 pt-2 border-t border-purple-900/30 animate-fadeIn">
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Step 2: Transfer Amount & Request Submission</h2>
                  <p className="text-xs text-[#A397C7]">Requests are submitted to admin for final verification & approval.</p>
                </div>
              </div>

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
                    className="w-full pl-4 pr-16 py-3.5 bg-[#0B0326] border-2 border-[#FF5A1F] rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/50 transition-all"
                  />
                  <div className="absolute right-0 top-0 bottom-0 px-4 bg-[#FF5A1F] text-white font-black text-xs flex items-center rounded-r-xl uppercase">
                    USD
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-sm tracking-widest uppercase shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Transfer Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferView;
