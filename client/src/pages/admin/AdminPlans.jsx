import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Award,
  Plus,
  Search,
  Grid,
  List,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Check,
  TrendingUp,
  Percent,
  Clock,
  ShieldCheck,
  Tag,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tokenSymbol: '',
    price: '',
    dailyReturnPercentage: '',
    frequency: 'Every 24 Hours',
    capitalBack: 'Yes',
    badgeTag: 'HOT',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast State
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

  // Fetch all investment plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/plans', getAuthHeaders());
      if (response.data && response.data.data) {
        setPlans(response.data.data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('[Admin Plans View] Error fetching plans:', error);
      // Fallback dev data
      setPlans([
        {
          _id: 'plan_shib_01',
          name: 'Shiba Inu (SHIB)',
          tokenSymbol: 'SHIB',
          price: 20.0,
          dailyReturnPercentage: 4.5,
          frequency: 'Every 24 Hours',
          capitalBack: true,
          badgeTag: 'HOT',
          isActive: true,
          totalSubscribers: 12,
        },
        {
          _id: 'plan_matic_02',
          name: 'Polygon (MATIC)',
          tokenSymbol: 'MATIC',
          price: 50.0,
          dailyReturnPercentage: 5.0,
          frequency: 'Every 24 Hours',
          capitalBack: true,
          badgeTag: 'Featured',
          isActive: true,
          totalSubscribers: 8,
        },
        {
          _id: 'plan_ada_03',
          name: 'Cardano (ADA)',
          tokenSymbol: 'ADA',
          price: 100.0,
          dailyReturnPercentage: 6.2,
          frequency: 'Every 24 Hours',
          capitalBack: true,
          badgeTag: 'Daily 6%',
          isActive: true,
          totalSubscribers: 15,
        },
        {
          _id: 'plan_avax_04',
          name: 'Avalanche (AVAX)',
          tokenSymbol: 'AVAX',
          price: 250.0,
          dailyReturnPercentage: 7.5,
          frequency: 'Every 24 Hours',
          capitalBack: true,
          badgeTag: 'High Yield',
          isActive: true,
          totalSubscribers: 5,
        },
        {
          _id: 'plan_sol_05',
          name: 'Solana (SOL)',
          tokenSymbol: 'SOL',
          price: 500.0,
          dailyReturnPercentage: 9.0,
          frequency: 'Every 24 Hours',
          capitalBack: true,
          badgeTag: 'VIP Tier',
          isActive: true,
          totalSubscribers: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Open Modal for Creating Plan
  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      tokenSymbol: '',
      price: '',
      dailyReturnPercentage: '',
      frequency: 'Every 24 Hours',
      capitalBack: 'Yes',
      badgeTag: 'HOT',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing Plan
  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      tokenSymbol: plan.tokenSymbol || '',
      price: plan.price !== undefined ? plan.price : '',
      dailyReturnPercentage: plan.dailyReturnPercentage !== undefined ? plan.dailyReturnPercentage : '',
      frequency: plan.frequency || 'Every 24 Hours',
      capitalBack: plan.capitalBack ? 'Yes' : 'No',
      badgeTag: plan.badgeTag || 'HOT',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Form Submit Handler (Create or Update)
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation checks
    if (!formData.name.trim() || !formData.tokenSymbol.trim()) {
      setFormError('Please enter plan name and token symbol.');
      return;
    }

    const priceNum = Number(formData.price);
    const returnNum = Number(formData.dailyReturnPercentage);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Minimum price amount must be a number greater than 0.');
      return;
    }

    if (isNaN(returnNum) || returnNum <= 0) {
      setFormError('Daily return yield percentage must be a number greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        tokenSymbol: formData.tokenSymbol,
        price: priceNum,
        dailyReturnPercentage: returnNum,
        frequency: formData.frequency,
        capitalBack: formData.capitalBack === 'Yes',
        badgeTag: formData.badgeTag,
      };

      if (editingPlan) {
        // PUT Update existing plan
        const res = await axios.put(`/api/admin/plans/${editingPlan._id}`, payload, getAuthHeaders());
        const updated = res.data?.data || { ...editingPlan, ...payload };
        showToast('Investment plan updated successfully!', 'success');

        setPlans((prev) =>
          prev.map((item) => (item._id === editingPlan._id ? { ...item, ...updated } : item))
        );
      } else {
        // POST Create new plan
        const res = await axios.post('/api/admin/plans', payload, getAuthHeaders());
        const created = res.data?.data || {
          _id: 'plan_' + Date.now(),
          ...payload,
          isActive: true,
          totalSubscribers: 0,
        };
        showToast('New investment plan created successfully!', 'success');

        setPlans((prev) => [...prev, created]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('[Admin Save Plan Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to save investment plan.';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Action Handler: Toggle Plan Status (Active / Disabled)
  const handleToggleStatus = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'toggle' }));
    try {
      const res = await axios.patch(`/api/admin/plans/${id}/toggle`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Plan status updated successfully!';
      showToast(msg, 'success');

      setPlans((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive: !item.isActive } : item))
      );
    } catch (error) {
      console.error('[Admin Toggle Plan Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to toggle plan status.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Action Handler: Delete Plan
  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    const id = deletingPlan._id;
    setActionLoading((prev) => ({ ...prev, [id]: 'delete' }));

    try {
      const res = await axios.delete(`/api/admin/plans/${id}`, getAuthHeaders());
      const msg = res.data?.message || 'Investment plan deleted successfully.';
      showToast(msg, 'success');

      setPlans((prev) => prev.filter((item) => item._id !== id));
      setDeletingPlan(null);
    } catch (error) {
      console.error('[Admin Delete Plan Error]:', error);
      const errMsg =
        error.response?.data?.error ||
        'Plan has active user investments and cannot be deleted. You can disable it instead.';
      showToast(errMsg, 'error');
      setDeletingPlan(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filter plans by search term
  const filteredPlans = plans.filter((plan) => {
    const name = plan.name || '';
    const symbol = plan.tokenSymbol || '';
    const badge = plan.badgeTag || '';

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Manage Investment Plans
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Configure plan prices, daily return yields, duration limits, and token assets.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start md:self-auto flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:from-amber-600 hover:to-[#FF5A1F] text-xs font-bold text-white transition-all shadow-lg shadow-[#FF5A1F]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Plan</span>
        </button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. TOP ACTION BAR (SEARCH & VIEW TOGGLE) ------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search plans by name or token symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        {/* View Switcher Toggle & Refresh */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchPlans}
            className="p-2.5 rounded-xl bg-[#07021A] border border-purple-800/40 text-purple-300 hover:text-white transition cursor-pointer"
            title="Refresh plan list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center bg-[#07021A] p-1 rounded-xl border border-purple-800/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FF5A1F] text-white shadow-md'
                  : 'text-purple-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FF5A1F] text-white shadow-md'
                  : 'text-purple-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------- 3. PLANS DISPLAY (GRID OR TABLE) ------------------- */}
      {loading ? (
        <div className="py-20 text-center text-purple-300 bg-[#0B0326] rounded-3xl border border-purple-900/30">
          <div className="flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F]" />
            <p className="text-xs font-semibold">Loading investment plans...</p>
          </div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-16 text-center text-purple-400 bg-[#0B0326] rounded-3xl border border-purple-900/30">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Award className="w-10 h-10 text-purple-500/50" />
            <p className="text-xs font-semibold">No investment plans found.</p>
            <p className="text-[11px] text-purple-500">
              Click "+ Create New Plan" to configure a new package.
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-gradient-to-b from-[#0B0326] to-[#140838] rounded-3xl p-6 border transition-all duration-300 relative space-y-5 flex flex-col justify-between shadow-xl ${
                plan.isActive
                  ? 'border-purple-800/40 hover:border-[#FF5A1F]/60'
                  : 'border-rose-900/40 opacity-75'
              }`}
            >
              <div>
                {/* Top Badge Tag & Status */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30">
                    {plan.badgeTag || 'HOT'}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 ${
                      plan.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        plan.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                    <span>{plan.isActive ? 'Active' : 'Disabled'}</span>
                  </span>
                </div>

                {/* Plan Header Title & Price */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-[#FF5A1F]">
                      ${Number(plan.price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-purple-300 font-semibold">USD Min</span>
                  </div>
                </div>

                {/* Plan Parameters List */}
                <div className="mt-5 space-y-2.5 pt-4 border-t border-purple-900/30 text-xs">
                  <div className="flex items-center justify-between text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Daily Return Yield:</span>
                    </div>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {plan.dailyReturnPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-purple-300">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Frequency:</span>
                    </div>
                    <span className="font-bold text-white">{plan.frequency || 'Every 24 Hours'}</span>
                  </div>

                  <div className="flex items-center justify-between text-purple-300">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Capital Back:</span>
                    </div>
                    <span className="font-bold text-white">
                      {plan.capitalBack ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-purple-300">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span>Subscribers:</span>
                    </div>
                    <span className="font-bold text-purple-200">{plan.totalSubscribers || 0} Users</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEditModal(plan)}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(plan._id)}
                  disabled={actionLoading[plan._id] !== undefined}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                    plan.isActive
                      ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-300'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/40 text-emerald-300'
                  }`}
                  title={plan.isActive ? 'Disable Plan' : 'Enable Plan'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{plan.isActive ? 'Disable' : 'Enable'}</span>
                </button>

                <button
                  onClick={() => setDeletingPlan(plan)}
                  className="py-2 px-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW MODE */
        <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A397C7]">
              <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
                <tr>
                  <th className="py-4 px-5">Plan Name / Token</th>
                  <th className="py-4 px-5">Price (USD)</th>
                  <th className="py-4 px-5">Daily Return (%)</th>
                  <th className="py-4 px-5">Return Frequency</th>
                  <th className="py-4 px-5">Capital Back</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Subscribers</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-900/20 font-medium">
                {filteredPlans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-purple-950/30 transition-colors">
                    {/* Name & Token */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white font-bold text-xs flex items-center justify-center border border-purple-500/30">
                          {plan.tokenSymbol ? plan.tokenSymbol.charAt(0) : 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{plan.name}</p>
                          <span className="text-[10px] text-[#FF5A1F] font-bold">
                            {plan.badgeTag || 'HOT'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5 font-black text-white text-sm">
                      ${Number(plan.price || 0).toFixed(2)}
                    </td>

                    {/* Return */}
                    <td className="py-4 px-5 font-black text-emerald-400 text-sm">
                      {plan.dailyReturnPercentage}%
                    </td>

                    {/* Frequency */}
                    <td className="py-4 px-5 text-purple-300 font-semibold">
                      {plan.frequency || 'Every 24 Hours'}
                    </td>

                    {/* Capital Back */}
                    <td className="py-4 px-5 font-bold text-white">
                      {plan.capitalBack ? 'Yes' : 'No'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                          plan.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            plan.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{plan.isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    {/* Subscribers */}
                    <td className="py-4 px-5 text-purple-300 font-bold">
                      {plan.totalSubscribers || 0} Users
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          className="p-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 text-purple-200 hover:text-white transition cursor-pointer"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(plan._id)}
                          className={`p-2 rounded-lg border transition cursor-pointer ${
                            plan.isActive
                              ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-300'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/40 text-emerald-300'
                          }`}
                          title={plan.isActive ? 'Disable Plan' : 'Enable Plan'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingPlan(plan)}
                          className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition cursor-pointer"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- 4. CREATE / EDIT PLAN MODAL DRAWER ------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-800/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPlan ? 'Edit Investment Plan' : 'Create New Investment Plan'}
                  </h3>
                  <p className="text-[11px] text-purple-400">
                    Configure pricing tiers, return yields, and token badges.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Alert inside Modal */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Plan Name <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Polygon (MATIC)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                {/* Token Symbol */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Token Symbol <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MATIC"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white uppercase placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Minimum Investment Amount */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Minimum Investment (USD) <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="100.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                    />
                  </div>
                </div>

                {/* Return Yield Percentage */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Daily Return Yield (%) <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">
                      %
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      placeholder="5.0"
                      value={formData.dailyReturnPercentage}
                      onChange={(e) =>
                        setFormData({ ...formData, dailyReturnPercentage: e.target.value })
                      }
                      className="w-full pl-4 pr-8 py-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Payout Frequency */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <option value="Every 24 Hours">Every 24 Hours</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>

                {/* Capital Back Option */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Capital Back</label>
                  <select
                    value={formData.capitalBack}
                    onChange={(e) => setFormData({ ...formData, capitalBack: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Plan Badge Tag */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="HOT / Daily 5%"
                    value={formData.badgeTag}
                    onChange={(e) => setFormData({ ...formData, badgeTag: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white uppercase placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:from-amber-600 hover:to-[#FF5A1F] disabled:opacity-50 text-white font-bold flex items-center space-x-2 transition shadow-lg shadow-[#FF5A1F]/30 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- 5. DELETE CONFIRMATION MODAL ------------------- */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-rose-900/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-purple-900/40 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Investment Plan</h3>
                <p className="text-[11px] text-purple-400">Confirm package removal</p>
              </div>
            </div>

            <p className="text-xs text-purple-200 leading-relaxed">
              Are you sure you want to delete the plan{' '}
              <span className="font-bold text-white">{deletingPlan.name}</span> (${deletingPlan.price})?
              If active user investments exist, deletion will be blocked by system safety rules.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
