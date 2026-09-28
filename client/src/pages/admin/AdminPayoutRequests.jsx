import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { listenToRealtimeEvents } from '../../services/socket';
import {
  ArrowUpRight,
  Search,
  Filter,
  Check,
  X,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Send,
  DollarSign,
  User,
  ShieldAlert,
} from 'lucide-react';

export const AdminPayoutRequests = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Admin headers helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Copy recipient wallet address to clipboard
  const handleCopyWallet = (address, id) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    showToast('Recipient wallet address copied to clipboard!', 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Fetch payout requests from Backend API
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/payouts', getAuthHeaders());
      if (response.data && response.data.data) {
        setPayouts(response.data.data);
      } else if (response.data && response.data.payouts) {
        setPayouts(response.data.payouts);
      } else {
        setPayouts([]);
      }
    } catch (error) {
      console.error('[Admin Payout View] Error fetching payout requests:', error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (event === 'payout_created' || event === 'payout_updated') {
        fetchPayouts();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Action Handler: Approve Payout Request
  const handleApprovePayout = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await axios.put(`/api/admin/payouts/approve/${id}`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Payout marked as complete!';
      showToast(msg, 'success');

      // Update local state in real-time
      setPayouts((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Approved' } : item))
      );
    } catch (error) {
      console.error('[Admin Approve Payout Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to approve payout request.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Action Handler: Reject & Refund Payout Request
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const id = rejectingItem._id;
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));

    try {
      const res = await axios.put(
        `/api/admin/payouts/reject/${id}`,
        { reason: rejectionReason || 'Payout Request Rejected by Admin' },
        getAuthHeaders()
      );
      const msg = res.data?.message || 'Payout rejected and funds refunded to user';
      showToast(msg, 'error');

      // Update local state in real-time
      setPayouts((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: 'Rejected',
                rejectionReason: rejectionReason || 'Payout Request Rejected by Admin',
              }
            : item
        )
      );

      // Close modal
      setRejectingItem(null);
      setRejectionReason('');
    } catch (error) {
      console.error('[Admin Reject Payout Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to reject payout request.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filter Logic (Search by Recipient Wallet Address, Tx ID, or Username)
  const filteredPayouts = payouts.filter((pay) => {
    const username = pay.user?.username || pay.username || '';
    const email = pay.user?.email || pay.email || '';
    const wallet = pay.recipientWalletAddress || '';
    const txId = pay.transactionId || pay._id || '';

    const matchesSearch =
      wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      pay.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
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
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Payout Requests
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Inspect recipient wallet addresses, calculate fees, and finalize pending payouts.
          </p>
        </div>

        <button
          onClick={fetchPayouts}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. SEARCH & FILTER CONTROLS ------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        {/* Quick Search by Recipient Wallet Address or Transaction ID */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search Recipient Wallet Address or Transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Status Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ------------------- 3. REQUESTS DATA TABLE ------------------- */}
      <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A397C7]">
            <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Transaction ID</th>
                <th className="py-4 px-5">Gateway</th>
                <th className="py-4 px-5">Requested Amount</th>
                <th className="py-4 px-5">Fee (10%)</th>
                <th className="py-4 px-5">Final Payout</th>
                <th className="py-4 px-5">Wallet Address</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-900/20 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-purple-300">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                      <p className="text-xs">Loading payout records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-purple-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ArrowUpRight className="w-8 h-8 text-purple-500/50" />
                      <p className="text-xs font-semibold">No payout requests found.</p>
                      <p className="text-[11px] text-purple-500">
                        Try adjusting your search criteria or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((item) => {
                  const isPending = item.status === 'Pending';
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  const username = item.user?.username || item.username || 'Unknown';
                  const email = item.user?.email || item.email || 'N/A';
                  const txId = item.transactionId || (item._id ? item._id.toString() : '-');
                  const gateway = item.gatewayType || item.gateway || 'USDT';

                  const rawAmount = Number(item.rawAmount || item.amount || 0);
                  const fee = item.derivedFees !== undefined ? Number(item.derivedFees) : Number(rawAmount * 0.1);
                  const finalPayout = item.finalDeductionAmount !== undefined ? Number(item.finalDeductionAmount) : Math.max(0, rawAmount - fee);

                  const walletAddress = item.recipientWalletAddress || item.walletAddress || 'N/A';
                  const truncatedWallet =
                    walletAddress !== 'N/A' && walletAddress.length > 14
                      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                      : walletAddress;

                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : 'N/A';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-purple-950/30 transition-colors"
                    >
                      {/* 1. User */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-[#FF5A1F] text-white font-bold text-xs flex items-center justify-center border border-purple-500/30">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{username}</p>
                            <p className="text-[10px] text-purple-400">{email}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Transaction ID */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-purple-200 bg-[#07021A] px-2.5 py-1 rounded-md border border-purple-800/30 text-[11px]">
                          {txId}
                        </span>
                      </td>

                      {/* 3. Gateway */}
                      <td className="py-4 px-5">
                        <span className="text-purple-300 font-semibold">{gateway}</span>
                      </td>

                      {/* 4. Requested Amount */}
                      <td className="py-4 px-5 font-bold text-white">
                        ${rawAmount.toFixed(2)}
                      </td>

                      {/* 5. Fee (10%) */}
                      <td className="py-4 px-5 text-rose-400 font-semibold">
                        -${fee.toFixed(2)}
                      </td>

                      {/* 6. Final Payout (Bold Coral/Orange Accent) */}
                      <td className="py-4 px-5">
                        <span className="text-[#FF5A1F] font-black text-sm drop-shadow-sm">
                          ${finalPayout.toFixed(2)}
                        </span>
                      </td>

                      {/* 7. Wallet Address + Copy Button */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2 bg-[#07021A] px-2.5 py-1.5 rounded-xl border border-purple-800/40 w-fit">
                          <span className="font-mono text-purple-200 font-semibold text-[11px]">
                            {truncatedWallet}
                          </span>
                          <button
                            onClick={() => handleCopyWallet(walletAddress, item._id)}
                            title="Copy full wallet address"
                            className="p-1 text-purple-400 hover:text-[#FF5A1F] transition cursor-pointer"
                          >
                            {copiedId === item._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 8. Status Badge */}
                      <td className="py-4 px-5">
                        {isPending && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}

                        {isApproved && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* 9. Date */}
                      <td className="py-4 px-5 text-purple-400 text-[11px]">
                        {formattedDate}
                      </td>

                      {/* 10. Action Buttons */}
                      <td className="py-4 px-5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            {/* Approve Payout Button */}
                            <button
                              onClick={() => handleApprovePayout(item._id)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                            >
                              {actionLoading[item._id] === 'approve' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>Approve Payout</span>
                            </button>

                            {/* Reject & Refund Button */}
                            <button
                              onClick={() => setRejectingItem(item)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Reject & Refund</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-500 italic uppercase">
                            Completed
                          </span>
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

      {/* ------------------- 4. REJECTION & REFUND CONFIRMATION MODAL ------------------- */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-rose-900/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reject & Refund Payout</h3>
                  <p className="text-[11px] text-purple-400">
                    Transaction ID: <span className="font-mono text-purple-200 font-bold">{rejectingItem.transactionId || rejectingItem._id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Refund Info Summary Box */}
            <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-purple-300">
                <span>Target User:</span>
                <span className="font-bold text-white">
                  {rejectingItem.user?.username || rejectingItem.username || 'Unknown User'}
                </span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span>Requested Amount:</span>
                <span className="font-bold text-white">
                  ${Number(rejectingItem.rawAmount || rejectingItem.amount || 0).toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-300 pt-1 border-t border-rose-900/40 font-bold">
                <span>Automated Refund to User Balance:</span>
                <span className="text-emerald-400 text-sm">
                  +${Number(rejectingItem.rawAmount || rejectingItem.finalDeductionAmount || rejectingItem.amount || 0).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Optional Rejection Reason Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-purple-300">
                Rejection Reason (Optional):
              </label>
              <textarea
                rows="3"
                placeholder="Specify reason (e.g. Invalid recipient wallet address, unverified user, etc.)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-400/40 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReject}
                disabled={actionLoading[rejectingItem._id] !== undefined}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                {actionLoading[rejectingItem._id] === 'reject' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4 stroke-[3]" />
                )}
                <span>Confirm Reject & Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutRequests;
