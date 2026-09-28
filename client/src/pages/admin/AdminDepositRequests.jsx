import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { listenToRealtimeEvents } from '../../services/socket';
import {
  Inbox,
  Search,
  Filter,
  Check,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const AdminDepositRequests = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProof, setSelectedProof] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  // Helper for admin headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  // Toast notification timer
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all deposit requests from Backend API
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/deposits', getAuthHeaders());
      if (response.data && response.data.data) {
        setDeposits(response.data.data);
      } else if (response.data && response.data.deposits) {
        setDeposits(response.data.deposits);
      } else {
        setDeposits([]);
      }
    } catch (error) {
      console.error('[Admin Deposit View] Error fetching deposit requests:', error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (event === 'deposit_created' || event === 'deposit_updated') {
        fetchDeposits();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Action Handler: Approve Deposit Request
  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      const res = await axios.put(`/api/admin/deposits/approve/${id}`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Deposit Approved and balance credited!';
      showToast(msg, 'success');

      // Update real-time local state
      setDeposits((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Approved' } : item))
      );

      // Close proof modal if currently inspecting this deposit
      if (selectedProof && selectedProof._id === id) {
        setSelectedProof((prev) => (prev ? { ...prev, status: 'Approved' } : null));
      }
    } catch (error) {
      console.error('[Admin Approve Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to approve deposit.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Action Handler: Reject Deposit Request
  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      const res = await axios.put(`/api/admin/deposits/reject/${id}`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Deposit Rejected';
      showToast(msg, 'error');

      // Update real-time local state
      setDeposits((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'Rejected' } : item))
      );

      // Close proof modal if currently inspecting this deposit
      if (selectedProof && selectedProof._id === id) {
        setSelectedProof((prev) => (prev ? { ...prev, status: 'Rejected' } : null));
      }
    } catch (error) {
      console.error('[Admin Reject Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to reject deposit.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filtering Logic (by search term & status filter)
  const filteredDeposits = deposits.filter((dep) => {
    const username = dep.user?.username || dep.username || '';
    const email = dep.user?.email || dep.email || '';
    const txId = dep.transactionId || dep._id || '';

    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      dep.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white bg-[#07021A] min-h-screen">
      {/* ------------------- TOAST NOTIFICATION OVERLAY ------------------- */}
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
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Deposit Requests
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Review, verify payment proof screenshots, and approve user deposits.
          </p>
        </div>

        <button
          onClick={fetchDeposits}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>

        {/* Ambient Purple Background Accent Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. FILTER & SEARCH BAR MODULE ------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search Transaction ID or Username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
          >
            <option value="All">All Requests</option>
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
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Proof Screenshot</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Created At</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-900/20 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-purple-300">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                      <p className="text-xs">Loading deposit records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-purple-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="w-8 h-8 text-purple-500/50" />
                      <p className="text-xs font-semibold">No deposit requests found.</p>
                      <p className="text-[11px] text-purple-500">
                        Try adjusting your search criteria or filter status.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((item) => {
                  const isPending = item.status === 'Pending';
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  const username = item.user?.username || item.username || 'john';
                  const email = item.user?.email || item.email || 'john@example.com';
                  const txId = item.transactionId || item._id || '09KBCBGZ8FU4';
                  const amount = Number(item.requestedAmount || 100).toFixed(2);
                  const gateway = item.gatewayType || 'USDT ( BEP 20 )';
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : 'Jul 20, 2026';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-purple-950/30 transition-colors"
                    >
                      {/* 1. User */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 text-white font-bold text-xs flex items-center justify-center border border-purple-500/30">
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

                      {/* 4. Amount */}
                      <td className="py-4 px-5">
                        <span className="text-emerald-400 font-black text-sm">
                          ${amount}
                        </span>
                      </td>

                      {/* 5. Proof Screenshot */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => setSelectedProof(item)}
                          className="group relative flex items-center space-x-2 p-1 bg-[#07021A] border border-purple-800/40 rounded-xl hover:border-[#FF5A1F] transition-all cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-purple-950 flex items-center justify-center">
                            {item.proofImage ? (
                              <img
                                src={item.proofImage}
                                alt="Payment Proof"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  // Fallback thumbnail placeholder if image URL doesn't load
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="hidden w-full h-full flex-col items-center justify-center bg-purple-900/60 text-purple-300"
                              style={{ display: item.proofImage ? 'none' : 'flex' }}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center space-x-1 pr-2 text-[10px] text-purple-300 group-hover:text-white font-bold">
                            <Eye className="w-3.5 h-3.5 text-[#FF5A1F]" />
                            <span>View</span>
                          </div>
                        </button>
                      </td>

                      {/* 6. Status Badge */}
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

                      {/* 7. Created At */}
                      <td className="py-4 px-5 text-purple-400 text-[11px]">
                        {formattedDate}
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-4 px-5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            {/* Approve Button */}
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                            >
                              {actionLoading[item._id] === 'approve' ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>Approve</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={actionLoading[item._id] !== undefined}
                              className="bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
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

      {/* ------------------- 4. PROOF SCREENSHOT PREVIEW MODAL ------------------- */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-800/50 rounded-3xl w-[92%] sm:w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Proof Verification</h3>
                  <p className="text-[11px] text-purple-400">
                    Transaction ID: <span className="font-mono text-purple-200 font-bold">{selectedProof.transactionId || selectedProof._id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deposit Request Summary Bar inside Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#07021A] p-3.5 rounded-2xl border border-purple-900/40 text-xs">
              <div>
                <p className="text-[10px] text-purple-400 font-medium">User</p>
                <p className="font-bold text-white truncate">
                  {selectedProof.user?.username || selectedProof.username || 'john'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-medium">Gateway</p>
                <p className="font-semibold text-purple-200 truncate">
                  {selectedProof.gatewayType || 'USDT BEP20'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-medium">Amount</p>
                <p className="font-black text-emerald-400">
                  ${Number(selectedProof.requestedAmount || 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-medium">Status</p>
                <span
                  className={`text-[10px] font-extrabold uppercase ${
                    selectedProof.status === 'Approved'
                      ? 'text-emerald-400'
                      : selectedProof.status === 'Rejected'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedProof.status}
                </span>
              </div>
            </div>

            {/* Proof Screenshot Image Viewer */}
            <div className="w-full max-h-[380px] rounded-2xl overflow-hidden border border-purple-900/40 bg-black flex items-center justify-center p-2">
              {selectedProof.proofImage ? (
                <img
                  src={selectedProof.proofImage}
                  alt="Proof Full Size"
                  className="max-h-[360px] w-auto object-contain rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="hidden w-full h-48 flex-col items-center justify-center text-purple-400 space-y-2"
                style={{ display: selectedProof.proofImage ? 'none' : 'flex' }}
              >
                <FileText className="w-10 h-10 text-purple-600" />
                <p className="text-xs">Payment proof screenshot preview unavailable</p>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              {selectedProof.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => handleReject(selectedProof._id)}
                    disabled={actionLoading[selectedProof._id] !== undefined}
                    className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>Reject Deposit</span>
                  </button>

                  <button
                    onClick={() => handleApprove(selectedProof._id)}
                    disabled={actionLoading[selectedProof._id] !== undefined}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Approve & Credit Balance</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedProof(null)}
                  className="px-5 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-900 text-white font-bold text-xs transition cursor-pointer"
                >
                  Close Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepositRequests;
