import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  DollarSign,
  Percent,
  AlertTriangle,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export const AdminPayoutMethods = () => {
  const [methods, setMethods] = useState([
    {
      _id: 'payout_usdt_bep20',
      name: 'USDT ( BEP 20 )',
      currency: 'USDT',
      network: 'BEP20',
      minAmount: 10,
      maxAmount: 10000,
      fixedCharge: 0,
      percentCharge: 10,
      status: 'Active',
      instruction: 'Enter recipient USDT BEP20 wallet address for automated/manual payout processing.',
    },
    {
      _id: 'payout_usdt_trc20',
      name: 'USDT ( TRC 20 )',
      currency: 'USDT',
      network: 'TRC20',
      minAmount: 20,
      maxAmount: 50000,
      fixedCharge: 1,
      percentCharge: 10,
      status: 'Active',
      instruction: 'Enter recipient USDT TRC20 wallet address for payout processing.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    currency: 'USDT',
    network: 'BEP20',
    minAmount: '10',
    maxAmount: '10000',
    fixedCharge: '0',
    percentCharge: '10',
    status: 'Active',
    instruction: '',
  });

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

  const handleOpenAddModal = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      currency: 'USDT',
      network: 'BEP20',
      minAmount: '10',
      maxAmount: '10000',
      fixedCharge: '0',
      percentCharge: '10',
      status: 'Active',
      instruction: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name || '',
      currency: method.currency || 'USDT',
      network: method.network || 'BEP20',
      minAmount: method.minAmount?.toString() || '10',
      maxAmount: method.maxAmount?.toString() || '10000',
      fixedCharge: method.fixedCharge?.toString() || '0',
      percentCharge: method.percentCharge?.toString() || '10',
      status: method.status || 'Active',
      instruction: method.instruction || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveMethod = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Payout method name is required.', 'error');
      return;
    }

    if (editingMethod) {
      setMethods((prev) =>
        prev.map((m) =>
          m._id === editingMethod._id
            ? {
                ...m,
                ...formData,
                minAmount: Number(formData.minAmount),
                maxAmount: Number(formData.maxAmount),
                fixedCharge: Number(formData.fixedCharge),
                percentCharge: Number(formData.percentCharge),
              }
            : m
        )
      );
      showToast('Payout method configuration updated successfully!', 'success');
    } else {
      const newMethod = {
        _id: `payout_gen_${Date.now()}`,
        ...formData,
        minAmount: Number(formData.minAmount),
        maxAmount: Number(formData.maxAmount),
        fixedCharge: Number(formData.fixedCharge),
        percentCharge: Number(formData.percentCharge),
      };
      setMethods((prev) => [...prev, newMethod]);
      showToast('New payout method created successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setMethods((prev) =>
      prev.map((m) =>
        m._id === id
          ? { ...m, status: m.status === 'Active' ? 'Disabled' : 'Active' }
          : m
      )
    );
    showToast('Payout method status updated!', 'success');
  };

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
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Payout Methods Configuration</h1>
          </div>
          <p className="text-xs text-[#A397C7]">Configure withdrawal gateways, percentage/fixed charges, and limits for investors.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="self-start md:self-auto flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs shadow-lg shadow-[#FF5A1F]/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Payout Gateway</span>
        </button>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => {
          const isActive = method.status === 'Active';
          return (
            <div
              key={method._id}
              className="bg-[#0B0326] border border-purple-900/30 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800/40 text-[#FF5A1F] flex items-center justify-center font-black text-sm">
                    {method.currency}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{method.name}</h2>
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Network: {method.network}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {method.status}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#140838]/60 p-4 rounded-2xl border border-purple-900/30">
                <div>
                  <span className="text-[#A397C7] block text-[10px] uppercase">Min Withdrawal Limit</span>
                  <span className="font-bold text-white">${method.minAmount?.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-[#A397C7] block text-[10px] uppercase">Max Withdrawal Limit</span>
                  <span className="font-bold text-white">${method.maxAmount?.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-[#A397C7] block text-[10px] uppercase">Percentage Fee</span>
                  <span className="font-bold text-[#FF5A1F]">{method.percentCharge}%</span>
                </div>
                <div>
                  <span className="text-[#A397C7] block text-[10px] uppercase">Fixed Charge</span>
                  <span className="font-bold text-rose-400">${method.fixedCharge?.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-xs text-purple-300/80 bg-[#07021A] p-3 rounded-xl border border-purple-900/30">
                <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Gateway Instructions:</span>
                <p className="italic">{method.instruction || 'No special instructions configured.'}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => handleToggleStatus(method._id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Disable Gateway' : 'Enable Gateway'}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(method)}
                  className="px-4 py-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-200 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Gateway</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0326] border border-purple-900/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingMethod ? 'Edit Payout Method' : 'Add New Payout Gateway'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-300 font-bold mb-1">Gateway Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. USDT ( BEP 20 )"
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Network</label>
                  <input
                    type="text"
                    required
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Max Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.fixedCharge}
                    onChange={(e) => setFormData({ ...formData, fixedCharge: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 font-bold mb-1">Percent Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.percentCharge}
                    onChange={(e) => setFormData({ ...formData, percentCharge: e.target.value })}
                    className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-1">Instructions / Note</label>
                <textarea
                  rows="3"
                  value={formData.instruction}
                  onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                  className="w-full p-3 bg-[#07021A] border border-purple-800/40 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs shadow-lg shadow-[#FF5A1F]/30 cursor-pointer"
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutMethods;
