import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { listenToRealtimeEvents } from '../../services/socket';
import {
  Send,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Check,
  X,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

export const AdminTransferRequests = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

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
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/transfers', getAuthHeaders());
      const list = response.data?.transfers || response.data?.data || [];
      setTransfers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('[Admin Transfers Error]:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (event === 'transfer_created' || event === 'transfer_updated') {
        fetchTransfers();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await axios.put(`/api/admin/transfers/approve/${id}`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Transfer request approved!';
      showToast(msg, 'success');
      setTransfers((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Approved' } : item))
      );
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to approve transfer request.';
      showToast(errMsg, 'error');
    } fontally: {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await axios.put(`/api/admin/transfers/reject/${id}`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Transfer request rejected.';
      showToast(msg, 'error');
      setTransfers((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Rejected' } : item))
      );
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to reject transfer request.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const filteredTransfers = transfers.filter((item) => {
    const senderUsername = item.sender?.username || item.senderUsername || '';
    const senderEmail = item.sender?.email || item.senderEmail || '';
    const recipientUsername = item.recipient?.username || item.recipientUsername || '';
    const recipientEmail = item.recipient?.email || item.recipientEmail || '';

    const matchesSearch =
      senderUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white bg-[#07021A] min-h-screen">
      {/* Toast Notification */}
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
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B0326] via-[#140838] to-[#0B0326] p-6 rounded-3xl border border-purple-900/40 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/30">
              <Send className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Transfer Requests</h1>
          </div>
          <p className="text-xs text-[#A397C7]">Review pending peer-to-peer balance transfer requests and approve settlement.</p>
        </div>

        <button
          onClick={fetchTransfers}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search Sender or Recipient Username/Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Status Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A397C7]">
            <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Sender</th>
                <th className="py-4 px-5">Recipient</th>
                <th className="py-4 px-5">Transfer Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Request Date</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-900/20 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-purple-300">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                      <p className="text-xs">Loading transfer requests...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-purple-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Send className="w-8 h-8 text-purple-500/50" />
                      <p className="text-xs font-semibold">No transfer requests found.</p>
                      <p className="text-[11px] text-purple-500">Submitted P2P transfer requests will appear here for review.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => {
                  const isPending = item.status === 'Pending';
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  const senderName = item.sender?.fullName || item.sender?.username || 'Unknown Sender';
                  const senderUser = item.sender?.username || 'user';
                  const senderEmail = item.sender?.email || 'N/A';

                  const recipientName = item.recipient?.fullName || item.recipient?.username || 'Unknown Recipient';
                  const recipientUser = item.recipient?.username || 'recipient';
                  const recipientEmail = item.recipient?.email || 'N/A';

                  const amountFormatted = Number(item.amount || 0).toFixed(2);
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : 'N/A';

                  return (
                    <tr key={item._id} className="hover:bg-purple-950/30 transition-colors">
                      {/* Sender */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-900 text-purple-200 font-bold text-xs flex items-center justify-center border border-purple-700/40">
                            {senderUser.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{senderName}</p>
                            <p className="text-[10px] text-[#FF5A1F] font-bold">@{senderUser}</p>
                            <p className="text-[10px] text-purple-400">{senderEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-[#FF5A1F] text-white font-bold text-xs flex items-center justify-center border border-purple-500/30">
                            {recipientUser.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{recipientName}</p>
                            <p className="text-[10px] text-emerald-400 font-bold">@{recipientUser}</p>
                            <p className="text-[10px] text-purple-400">{recipientEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Transfer Amount */}
                      <td className="py-4 px-5">
                        <span className="text-[#FF5A1F] font-black text-sm drop-shadow-sm">
                          ${amountFormatted} USD
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5">
                        {isPending && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pending Review</span>
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

                      {/* Date */}
                      <td className="py-4 px-5 text-purple-400 text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-md cursor-pointer"
                            >
                              {actionLoading[item._id] === 'approve' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-md cursor-pointer"
                            >
                              {actionLoading[item._id] === 'reject' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <X className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-500 italic uppercase">
                            Processed
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
    </div>
  );
};

export default AdminTransferRequests;
