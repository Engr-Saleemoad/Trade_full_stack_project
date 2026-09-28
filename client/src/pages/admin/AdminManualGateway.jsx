import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  QrCode,
  Video,
  DollarSign,
  Percent,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminManualGateway = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [deletingGateway, setDeletingGateway] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USDT',
    network: 'BEP20',
    walletAddress: '',
    videoGuideUrl: '',
    minAmount: '20',
    maxAmount: '10000',
    fixedCharge: '0',
    percentCharge: '0',
    instruction: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // Copy to clipboard helper
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Wallet address copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch all payment gateways
  const fetchGateways = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/gateways', getAuthHeaders());
      if (response.data && response.data.data) {
        setGateways(response.data.data);
      } else {
        setGateways([]);
      }
    } catch (error) {
      console.error('[Admin Gateways View] Error fetching gateways:', error);
      // Fallback dev state data
      setGateways([
        {
          _id: 'gate_usdt_bep20_01',
          name: 'USDT BEP20',
          currency: 'USDT',
          network: 'BNB Smart Chain BEP20',
          walletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
          videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          minAmount: 20.0,
          maxAmount: 10000.0,
          fixedCharge: 0.0,
          percentCharge: 0.0,
          instruction:
            'Send exact USDT BEP20 amount to this wallet address. Upload payment screenshot for verification.',
          isActive: true,
        },
        {
          _id: 'gate_usdt_trc20_02',
          name: 'USDT TRC20',
          currency: 'USDT',
          network: 'TRON Network TRC20',
          walletAddress: 'TYD92hKn81gH7sKqL93kJsLq87sKa',
          videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          minAmount: 50.0,
          maxAmount: 50000.0,
          fixedCharge: 1.0,
          percentCharge: 0.5,
          instruction:
            'Send exact USDT TRC20 amount to this TRON address. Note: TRC20 transactions settle within 3-5 minutes.',
          isActive: true,
        },
        {
          _id: 'gate_btc_03',
          name: 'Bitcoin BTC',
          currency: 'BTC',
          network: 'Bitcoin Mainnet',
          walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          videoGuideUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          minAmount: 100.0,
          maxAmount: 100000.0,
          fixedCharge: 0.0,
          percentCharge: 1.0,
          instruction:
            'Send Bitcoin to this address. Requires 2 network confirmations before approval.',
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingGateway(null);
    setFormData({
      name: '',
      currency: 'USDT',
      network: 'BEP20',
      walletAddress: '',
      videoGuideUrl: '',
      minAmount: '20',
      maxAmount: '10000',
      fixedCharge: '0',
      percentCharge: '0',
      instruction: 'Send exact amount to this receiving wallet address and upload payment screenshot for instant verification.',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (gateway) => {
    setEditingGateway(gateway);
    setFormData({
      name: gateway.name || '',
      currency: gateway.currency || 'USDT',
      network: gateway.network || 'BEP20',
      walletAddress: gateway.walletAddress || '',
      videoGuideUrl: gateway.videoGuideUrl || '',
      minAmount: gateway.minAmount !== undefined ? gateway.minAmount.toString() : '20',
      maxAmount: gateway.maxAmount !== undefined ? gateway.maxAmount.toString() : '10000',
      fixedCharge: gateway.fixedCharge !== undefined ? gateway.fixedCharge.toString() : '0',
      percentCharge: gateway.percentCharge !== undefined ? gateway.percentCharge.toString() : '0',
      instruction: gateway.instruction || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Save Gateway Form (Create or Update)
  const handleSaveGateway = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.walletAddress.trim()) {
      setFormError('Please enter gateway name and receiving wallet address.');
      return;
    }

    const min = Number(formData.minAmount);
    const max = Number(formData.maxAmount);

    if (isNaN(min) || min <= 0) {
      setFormError('Minimum deposit limit must be a number greater than 0.');
      return;
    }

    if (isNaN(max) || max < min) {
      setFormError('Maximum deposit limit must be greater than or equal to minimum limit.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        currency: formData.currency,
        network: formData.network,
        walletAddress: formData.walletAddress,
        videoGuideUrl: formData.videoGuideUrl,
        minAmount: min,
        maxAmount: max,
        fixedCharge: Number(formData.fixedCharge) || 0,
        percentCharge: Number(formData.percentCharge) || 0,
        instruction: formData.instruction,
      };

      if (editingGateway) {
        // PUT Update
        const res = await axios.put(`/api/admin/gateways/${editingGateway._id}`, payload, getAuthHeaders());
        const updated = res.data?.data || { ...editingGateway, ...payload };
        showToast('Payment gateway updated successfully!', 'success');

        setGateways((prev) =>
          prev.map((g) => (g._id === editingGateway._id ? { ...g, ...updated } : g))
        );
      } else {
        // POST Create
        const res = await axios.post('/api/admin/gateways', payload, getAuthHeaders());
        const created = res.data?.data || {
          _id: 'gate_' + Date.now(),
          ...payload,
          isActive: true,
        };
        showToast('New payment gateway configured successfully!', 'success');

        setGateways((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('[Admin Save Gateway Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to save gateway configuration.';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Action Handler: Toggle Status
  const handleToggleStatus = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'toggle' }));
    try {
      const res = await axios.patch(`/api/admin/gateways/${id}/toggle`, {}, getAuthHeaders());
      const msg = res.data?.message || 'Gateway status updated!';
      showToast(msg, 'success');

      setGateways((prev) =>
        prev.map((g) => (g._id === id ? { ...g, isActive: !g.isActive } : g))
      );
    } catch (error) {
      console.error('[Admin Toggle Gateway Error]:', error);
      const errMsg = error.response?.data?.error || 'Failed to toggle gateway status.';
      showToast(errMsg, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Action Handler: Delete Gateway
  const handleConfirmDelete = async () => {
    if (!deletingGateway) return;
    const id = deletingGateway._id;
    setActionLoading((prev) => ({ ...prev, [id]: 'delete' }));

    try {
      const res = await axios.delete(`/api/admin/gateways/${id}`, getAuthHeaders());
      const msg = res.data?.message || 'Payment gateway deleted successfully.';
      showToast(msg, 'success');

      setGateways((prev) => prev.filter((g) => g._id !== id));
      setDeletingGateway(null);
    } catch (error) {
      console.error('[Admin Delete Gateway Error]:', error);
      const errMsg =
        error.response?.data?.error ||
        'Cannot delete gateway while pending user deposit requests exist for it. You can disable it instead.';
      showToast(errMsg, 'error');
      setDeletingGateway(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // Filter Gateways
  const filteredGateways = gateways.filter((g) => {
    const name = g.name || '';
    const symbol = g.currency || '';
    const network = g.network || '';
    const wallet = g.walletAddress || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && g.isActive) ||
      (statusFilter === 'Disabled' && !g.isActive);

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
              <Wallet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Manual Gateways
            </h1>
          </div>
          <p className="text-xs text-[#A397C7]">
            Manage deposit receiving addresses, set transaction fee rules, and update payment guides.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start md:self-auto flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:from-amber-600 hover:to-[#FF5A1F] text-xs font-bold text-white transition-all shadow-lg shadow-[#FF5A1F]/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Gateway</span>
        </button>

        {/* Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ------------------- 2. ACTION & FILTER BAR ------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search by gateway, network, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchGateways}
            className="p-2.5 rounded-xl bg-[#07021A] border border-purple-800/40 text-purple-300 hover:text-white transition cursor-pointer"
            title="Refresh gateways list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
          >
            <option value="All">All Gateways</option>
            <option value="Active">Active Gateways</option>
            <option value="Disabled">Disabled Gateways</option>
          </select>
        </div>
      </div>

      {/* ------------------- 3. GATEWAYS CARD GRID ------------------- */}
      {loading ? (
        <div className="py-20 text-center text-purple-300 bg-[#0B0326] rounded-3xl border border-purple-900/30">
          <div className="flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F]" />
            <p className="text-xs font-semibold">Loading payment gateways...</p>
          </div>
        </div>
      ) : filteredGateways.length === 0 ? (
        <div className="py-16 text-center text-purple-400 bg-[#0B0326] rounded-3xl border border-purple-900/30">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Wallet className="w-10 h-10 text-purple-500/50" />
            <p className="text-xs font-semibold">No payment gateways configured.</p>
            <p className="text-[11px] text-purple-500">
              Click "+ Add New Gateway" to create a receiving address.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGateways.map((item) => {
            const isCopied = copiedId === item._id;
            const fixedFee = Number(item.fixedCharge || 0);
            const percentFee = Number(item.percentCharge || 0);
            let feeString = '0 USD';
            if (fixedFee > 0 && percentFee > 0) {
              feeString = `$${fixedFee.toFixed(2)} + ${percentFee}%`;
            } else if (fixedFee > 0) {
              feeString = `$${fixedFee.toFixed(2)} USD`;
            } else if (percentFee > 0) {
              feeString = `${percentFee}%`;
            }

            return (
              <div
                key={item._id}
                className={`bg-gradient-to-b from-[#0B0326] to-[#140838] rounded-3xl p-6 border transition-all duration-300 relative space-y-5 flex flex-col justify-between shadow-xl ${
                  item.isActive
                    ? 'border-purple-800/40 hover:border-[#FF5A1F]/60'
                    : 'border-rose-900/40 opacity-75'
                }`}
              >
                <div>
                  {/* Top Header & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white font-black text-xs flex items-center justify-center border border-purple-500/30 shadow-md">
                        {item.currency ? item.currency.slice(0, 4) : 'CRYP'}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{item.name}</h3>
                        <p className="text-[11px] text-[#FF5A1F] font-bold">
                          {item.network || 'BEP20'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center space-x-1 ${
                        item.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                      />
                      <span>{item.isActive ? 'Active' : 'Disabled'}</span>
                    </span>
                  </div>

                  {/* Wallet Address Box with Copy Button & Quick QR Tooltip */}
                  <div className="mt-4 p-3 bg-[#07021A] rounded-2xl border border-purple-800/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-purple-400 font-semibold">
                      <span>Receiving Wallet Address</span>
                      <div className="flex items-center space-x-1 text-[#FF5A1F]">
                        <QrCode className="w-3 h-3" />
                        <span>QR Ready</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-white truncate max-w-[210px]" title={item.walletAddress}>
                        {item.walletAddress}
                      </span>

                      <button
                        onClick={() => copyToClipboard(item.walletAddress, item._id)}
                        className="p-1.5 rounded-lg bg-purple-950 border border-purple-800/40 text-purple-200 hover:text-white hover:border-[#FF5A1F] transition cursor-pointer shrink-0"
                        title="Copy receiving wallet address"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Limits & Charges */}
                  <div className="mt-4 space-y-2 pt-3 border-t border-purple-900/30 text-xs">
                    <div className="flex items-center justify-between text-purple-300">
                      <span>Min/Max Deposit Limits:</span>
                      <span className="font-bold text-white">
                        ${Number(item.minAmount || 0).toFixed(2)} - ${Number(item.maxAmount || 0).toFixed(2)} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-purple-300">
                      <span>Charge Fee:</span>
                      <span className="font-bold text-emerald-400">{feeString}</span>
                    </div>

                    {item.instruction && (
                      <div className="pt-2">
                        <p className="text-[10px] text-purple-400 font-semibold mb-0.5">Instructions:</p>
                        <p className="text-[11px] text-purple-200 line-clamp-2 italic">
                          "{item.instruction}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800/40 text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item._id)}
                    disabled={actionLoading[item._id] !== undefined}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                      item.isActive
                        ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-300'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/40 text-emerald-300'
                    }`}
                    title={item.isActive ? 'Disable Gateway' : 'Activate Gateway'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{item.isActive ? 'Disable' : 'Enable'}</span>
                  </button>

                  <button
                    onClick={() => setDeletingGateway(item)}
                    className="py-2 px-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition cursor-pointer"
                    title="Delete Gateway"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------- 4. "CREATE / EDIT GATEWAY" MODAL DRAWER ------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-800/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4 sticky top-0 bg-[#0B0326] z-10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 text-white flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingGateway ? 'Edit Manual Gateway' : 'Configure New Gateway'}
                  </h3>
                  <p className="text-[11px] text-purple-400">
                    Set receiving crypto address, deposit limits, and transfer instructions.
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

            {/* Error Alert */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Gateway Form */}
            <form onSubmit={handleSaveGateway} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gateway Name */}
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Gateway Name <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. USDT BEP20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                {/* Asset Currency */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Asset Symbol</label>
                  <input
                    type="text"
                    placeholder="USDT / BTC"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white uppercase placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                {/* Network */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">Network</label>
                  <input
                    type="text"
                    placeholder="BEP20 / TRC20"
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* Receiving Wallet Address (Mandatory) */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">
                  Receiving Wallet Address <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0x86A04560103588BFA89B478E09F6d89C0C858eEB"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white font-mono placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>

              {/* Video Tutorial Guide Link */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">
                  Tutorial Video Embed Link (YouTube)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  value={formData.videoGuideUrl}
                  onChange={(e) => setFormData({ ...formData, videoGuideUrl: e.target.value })}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>

              {/* Min & Max Deposit Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Minimum Deposit (USD) <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="20.00"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Maximum Deposit (USD) <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="10000.00"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* Fee Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Fixed Transaction Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.fixedCharge}
                    onChange={(e) => setFormData({ ...formData, fixedCharge: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-purple-300">
                    Percentage Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={formData.percentCharge}
                    onChange={(e) => setFormData({ ...formData, percentCharge: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                </div>
              </div>

              {/* User Deposit Instructions */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-purple-300">
                  User Payment Instructions
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide instructions shown to customers during deposit (e.g. Send exact BEP20 USDT. Screenshot required)..."
                  value={formData.instruction}
                  onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
                />
              </div>

              {/* Form Action Controls */}
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
                  <span>{editingGateway ? 'Update Gateway' : 'Save Gateway'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- 5. DELETE CONFIRMATION MODAL ------------------- */}
      {deletingGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-rose-900/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-purple-900/40 pb-4">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Gateway Configuration</h3>
                <p className="text-[11px] text-purple-400">Confirm payment option removal</p>
              </div>
            </div>

            <p className="text-xs text-purple-200 leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-bold text-white">{deletingGateway.name}</span>? If pending user deposit requests exist for this gateway, deletion will be blocked by system safety rules.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingGateway(null)}
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

export default AdminManualGateway;
