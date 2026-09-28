import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Check,
  Eye,
  Sliders,
  UserCheck,
  UserX,
  CreditCard,
  TrendingUp,
  Award,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [inspectingUser, setInspectingUser] = useState(null);

  // Balance Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    balanceType: 'Main Balance',
    actionType: 'Add / Credit (+)',
    amount: '',
    remark: '',
  });
  const [adjustError, setAdjustError] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Toast & Action Loading States
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Auth Headers
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
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch registered users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/users', {
        ...getAuthHeaders(),
        params: { search: searchTerm, status: statusFilter },
      });
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('[Admin Users View] Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  // Open Balance Adjustment Modal
  const handleOpenAdjustModal = (user) => {
    setAdjustingUser(user);
    setAdjustForm({
      balanceType: 'Main Balance',
      actionType: 'Add / Credit (+)',
      amount: '',
      remark: '',
    });
    setAdjustError('');
  };

  // Submit Balance Adjustment
  const handleExecuteAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustingUser) return;
    setAdjustError('');

    const amountNum = Number(adjustForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setAdjustError('Adjustment amount must be a number greater than 0.');
      return;
    }

    if (!adjustForm.remark.trim()) {
      setAdjustError('Please provide a mandatory admin remark explaining the adjustment.');
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await axios.put(
        `/api/admin/users/${adjustingUser._id}/adjust-balance`,
        {
          balanceType: adjustForm.balanceType,
          actionType: adjustForm.actionType,
          amount: amountNum,
          remark: adjustForm.remark,
        },
        getAuthHeaders()
      );

      const msg = res.data?.message || 'Balance adjusted successfully!';
      showToast(msg, 'success');

      // Update real-time state
      const isCredit = adjustForm.actionType.includes('+') || adjustForm.actionType === 'credit';
      const delta = isCredit ? amountNum : -amountNum;
      const field = adjustForm.balanceType === 'Interest Balance' ? 'interestBalance' : 'mainBalance';

      setUsers((prev) =>
        prev.map((u) =>
          u._id === adjustingUser._id
            ? { ...u, [field]: Math.max(0, (u[field] || 0) + delta) }
            : u
        )
      );

      setAdjustingUser(null);
    } catch (error) {
      console.error('[Admin Adjust Balance Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to adjust user balance.';
      setAdjustError(errMsg);
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Action Handler: Change User Status (Active, Suspended, Blocked)
  const handleUpdateUserStatus = async (id, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'status' }));
    try {
      const res = await axios.patch(
        `/api/admin/users/${id}/status`,
        { newStatus },
        getAuthHeaders()
      );
      const msg = res.data?.message || `User status changed to ${newStatus}`;
      showToast(msg, 'success');

      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === id) {
            const isSuspendedOrBlocked = newStatus === 'Suspended' || newStatus === 'Blocked';
            return {
              ...u,
              status: newStatus,
              isSuspended: isSuspendedOrBlocked,
            };
          }
          return u;
        })
      );

      if (inspectingUser && inspectingUser._id === id) {
        setInspectingUser((prev) =>
          prev ? { ...prev, status: newStatus, isSuspended: newStatus !== 'Active' } : null
        );
      }
    } catch (error) {
      console.error('[Admin Update User Status Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to update user status.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filter users by search term & status
  const filteredUsers = users.filter((u) => {
    const username = u.username || '';
    const email = u.email || '';
    const name = `${u.firstName || ''} ${u.lastName || ''}`;

    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = u.status || (u.isSuspended ? 'Suspended' : 'Active');

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && currentStatus === 'Active') ||
      (statusFilter === 'Suspended' && currentStatus === 'Suspended') ||
      (statusFilter === 'Blocked' && currentStatus === 'Blocked');

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
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              User Management
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Monitor user profiles, analyze investor activity, and execute direct balance adjustments.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. SEARCH & FILTER CONTROLS ------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search by Username or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Account Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
          >
            <option value="All">All Users</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended Accounts</option>
            <option value="Blocked">Blocked Accounts</option>
          </select>
        </div>
      </div>

      {/* ------------------- 3. USERS DATA TABLE ------------------- */}
      <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A397C7]">
            <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">User Info</th>
                <th className="py-4 px-5">Contact Details</th>
                <th className="py-4 px-5">Main Balance</th>
                <th className="py-4 px-5">Interest Balance</th>
                <th className="py-4 px-5">Total Invested</th>
                <th className="py-4 px-5">Status Selector</th>
                <th className="py-4 px-5">Joined Date</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-900/20 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-purple-300">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                      <p className="text-xs">Loading user list...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-purple-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-purple-500/50" />
                      <p className="text-xs font-semibold">No users matching search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const currentStatus = item.status || (item.isSuspended ? 'Suspended' : 'Active');
                  const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.username;
                  const username = item.username || 'user';
                  const email = item.email || 'N/A';
                  const phone = item.phone || 'N/A';
                  const mainBal = Number(item.mainBalance || 0).toFixed(2);
                  const interestBal = Number(item.interestBalance || 0).toFixed(2);
                  const totalInvested = Number(item.totalInvest || 0).toFixed(2);
                  const joinedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : 'Jul 2026';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-purple-950/30 transition-colors"
                    >
                      {/* 1. User Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white font-bold text-xs flex items-center justify-center border border-purple-500/30 shadow-md">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{fullName}</p>
                            <p className="text-[11px] text-[#FF5A1F] font-semibold">@{username}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact Details */}
                      <td className="py-4 px-5">
                        <p className="text-purple-200 font-semibold">{email}</p>
                        <p className="text-[10px] text-purple-400">{phone}</p>
                      </td>

                      {/* 3. Main Balance */}
                      <td className="py-4 px-5">
                        <span className="font-black text-white text-sm">
                          ${mainBal}
                        </span>
                      </td>

                      {/* 4. Interest Balance */}
                      <td className="py-4 px-5">
                        <span className="font-black text-[#FF5A1F] text-sm">
                          ${interestBal}
                        </span>
                      </td>

                      {/* 5. Total Invested */}
                      <td className="py-4 px-5 text-purple-300 font-bold">
                        ${totalInvested}
                      </td>

                      {/* 6. Interactive Multi-Status Dropdown Selector */}
                      <td className="py-4 px-5">
                        {actionLoading[item._id] === 'status' ? (
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-900/50 text-purple-200 border border-purple-700/50">
                            <RefreshCw className="w-3 h-3 animate-spin text-[#FF5A1F]" />
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <select
                            value={currentStatus}
                            onChange={(e) => handleUpdateUserStatus(item._id, e.target.value)}
                            className={`font-extrabold text-[11px] px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all shadow-md ${
                              currentStatus === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : currentStatus === 'Suspended'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                          >
                            <option value="Active" className="bg-[#0B0326] text-emerald-400 font-bold">
                              ● Active
                            </option>
                            <option value="Suspended" className="bg-[#0B0326] text-amber-400 font-bold">
                              ● Suspended
                            </option>
                            <option value="Blocked" className="bg-[#0B0326] text-rose-400 font-bold">
                              ● Blocked
                            </option>
                          </select>
                        )}
                      </td>

                      {/* 7. Joined Date */}
                      <td className="py-4 px-5 text-purple-400 text-[11px]">
                        {joinedDate}
                      </td>

                      {/* 8. Actions Menu */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Adjust Balance */}
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 text-purple-200 hover:text-white transition cursor-pointer"
                            title="Adjust Balance (Credit/Debit)"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          </button>

                          {/* Quick Status Action Menu */}
                          {currentStatus !== 'Active' ? (
                            <button
                              onClick={() => handleUpdateUserStatus(item._id, 'Active')}
                              disabled={actionLoading[item._id] !== undefined}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-800/40 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 transition cursor-pointer"
                              title="Reactivate User"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUserStatus(item._id, 'Suspended')}
                              disabled={actionLoading[item._id] !== undefined}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/80 border border-amber-800/40 text-amber-300 font-bold text-[10px] flex items-center space-x-1 transition cursor-pointer"
                              title="Suspend User"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setInspectingUser(item)}
                            className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 text-purple-200 hover:text-white transition cursor-pointer"
                            title="View User Ledger Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------- 4. "ADJUST BALANCE" MODAL ------------------- */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-800/50 rounded-3xl w-[92%] sm:w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manual Balance Adjustment</h3>
                  <p className="text-[11px] text-purple-400">
                    Directly credit or debit user funds in real time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAdjustingUser(null)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Alert */}
            {adjustError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            {/* Adjustment Form */}
            <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
              {/* Target User (Read-Only) */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">Target User</label>
                <input
                  type="text"
                  readOnly
                  value={`@${adjustingUser.username} (${adjustingUser.email})`}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white font-bold cursor-not-allowed opacity-90"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Balance Type Selection */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Balance Type</label>
                  <select
                    value={adjustForm.balanceType}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, balanceType: e.target.value })
                    }
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <option value="Main Balance">Main Balance (${Number(adjustingUser.mainBalance || 0).toFixed(2)})</option>
                    <option value="Interest Balance">Interest Balance (${Number(adjustingUser.interestBalance || 0).toFixed(2)})</option>
                  </select>
                </div>

                {/* Action Type */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Action Type</label>
                  <select
                    value={adjustForm.actionType}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, actionType: e.target.value })
                    }
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <option value="Add / Credit (+)">Add / Credit (+)</option>
                    <option value="Deduct / Debit (-)">Deduct / Debit (-)</option>
                  </select>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">
                  Adjustment Amount (USD) <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="50.00"
                    value={adjustForm.amount}
                    onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white font-bold placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* Mandatory Admin Remark */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">
                  Admin Remark / Reason <span className="text-[#FF5A1F]">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain reason for manual adjustment (e.g. Promotional bonus, manual deposit correction, system refund)..."
                  value={adjustForm.remark}
                  onChange={(e) => setAdjustForm({ ...adjustForm, remark: e.target.value })}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:from-amber-600 hover:to-[#FF5A1F] disabled:opacity-50 text-white font-bold flex items-center space-x-2 transition shadow-lg shadow-[#FF5A1F]/30 cursor-pointer"
                >
                  {submittingAdjust ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>Execute Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- 5. USER DETAILS INSPECTION DRAWER ------------------- */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-800/50 rounded-3xl w-[92%] sm:w-full max-w-xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 shadow-2xl relative">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {inspectingUser.username ? inspectingUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {inspectingUser.firstName} {inspectingUser.lastName}
                  </h3>
                  <p className="text-[11px] text-[#FF5A1F] font-bold">
                    @{inspectingUser.username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingUser(null)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Grid Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#07021A] p-3.5 rounded-2xl border border-purple-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </div>
                <p className="font-bold text-white truncate">{inspectingUser.email}</p>
              </div>

              <div className="bg-[#07021A] p-3.5 rounded-2xl border border-purple-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </div>
                <p className="font-bold text-white truncate">{inspectingUser.phone || 'N/A'}</p>
              </div>

              <div className="bg-[#07021A] p-3.5 rounded-2xl border border-purple-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Country</span>
                </div>
                <p className="font-bold text-white truncate">{inspectingUser.country || 'N/A'}</p>
              </div>

              <div className="bg-[#07021A] p-3.5 rounded-2xl border border-purple-900/40 space-y-1">
                <div className="flex items-center space-x-2 text-purple-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Account Status</span>
                </div>
                <p
                  className={`font-black ${
                    (inspectingUser.status || (inspectingUser.isSuspended ? 'Suspended' : 'Active')) === 'Active'
                      ? 'text-emerald-400'
                      : (inspectingUser.status || (inspectingUser.isSuspended ? 'Suspended' : 'Active')) === 'Suspended'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {inspectingUser.status || (inspectingUser.isSuspended ? 'Suspended' : 'Active')}
                </p>
              </div>
            </div>

            {/* Ledger Balances Summary Grid */}
            <div className="bg-[#07021A] p-4 rounded-2xl border border-purple-900/40 space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Financial Ledger Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                  <p className="text-[10px] text-purple-400 font-medium">Main Balance</p>
                  <p className="font-black text-white text-sm">
                    ${Number(inspectingUser.mainBalance || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                  <p className="text-[10px] text-purple-400 font-medium">Interest Balance</p>
                  <p className="font-black text-[#FF5A1F] text-sm">
                    ${Number(inspectingUser.interestBalance || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                  <p className="text-[10px] text-purple-400 font-medium">Total Invested</p>
                  <p className="font-bold text-purple-200 text-xs">
                    ${Number(inspectingUser.totalInvest || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                  <p className="text-[10px] text-purple-400 font-medium">Total Payout</p>
                  <p className="font-bold text-purple-200 text-xs">
                    ${Number(inspectingUser.totalPayout || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  const target = inspectingUser;
                  setInspectingUser(null);
                  handleOpenAdjustModal(target);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-[#FF5A1F]/20 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Adjust Balance</span>
              </button>

              <button
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-white font-bold text-xs transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
