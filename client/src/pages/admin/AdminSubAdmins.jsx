import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/adminAxios';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Inbox,
  ArrowUpRight,
  TrendingUp,
  Megaphone,
  Settings,
  Shield,
  Save,
  Check,
  Laptop,
  Award,
  Percent,
  Receipt,
  Send,
} from 'lucide-react';

const MODULE_LIST = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'device_logs', label: 'User Device Details (Master Admin)', icon: Laptop },
  { id: 'deposits', label: 'Deposit Requests', icon: Inbox },
  { id: 'payouts', label: 'Payout Requests & Logs', icon: ArrowUpRight },
  { id: 'investments', label: 'Customer Investments', icon: TrendingUp },
  { id: 'notices', label: 'Notice Board', icon: Megaphone },
  { id: 'plans', label: 'Plan List', icon: Award },
  { id: 'referrals', label: 'Referral System', icon: Percent },
  { id: 'transactions', label: 'Transactions Ledger', icon: Receipt },
  { id: 'transfers', label: 'Transfer Requests', icon: Send },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export const AdminSubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Create Sub-Admin Form State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({ username: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // Permission Matrix Modal State
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [permissionsMatrix, setPermissionsMatrix] = useState({});
  const [savingPerms, setSavingPerms] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/api/admin/sub-admins');
      if (res.data && res.data.data) {
        setSubAdmins(res.data.data);
      }
    } catch (err) {
      console.error('[Fetch Sub-Admins Error]:', err);
      showToast('Failed to load sub-admins list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!newSubAdmin.username || !newSubAdmin.email || !newSubAdmin.password) {
      showToast('Please fill all sub-admin fields.', 'error');
      return;
    }

    setCreating(true);
    try {
      const res = await adminAPI.post('/api/admin/sub-admins', newSubAdmin);
      showToast(res.data.message || 'Sub-Admin account created successfully!', 'success');
      setNewSubAdmin({ username: '', email: '', password: '' });
      setCreateModalOpen(false);
      fetchSubAdmins();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create sub-admin.';
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenPermModal = (subAdmin) => {
    setSelectedSubAdmin(subAdmin);
    
    // Ensure standard object structure
    const initialPerms = {};
    MODULE_LIST.forEach((m) => {
      initialPerms[m.id] = {
        read: subAdmin.permissions?.[m.id]?.read || false,
        update: subAdmin.permissions?.[m.id]?.update || false,
        delete: subAdmin.permissions?.[m.id]?.delete || false,
      };
    });

    setPermissionsMatrix(initialPerms);
    setPermModalOpen(true);
  };

  const handleCheckboxChange = (moduleId, action) => {
    setPermissionsMatrix((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action],
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedSubAdmin) return;
    setSavingPerms(true);
    try {
      const res = await adminAPI.put(`/api/admin/sub-admins/${selectedSubAdmin._id}/permissions`, {
        permissions: permissionsMatrix,
      });
      showToast('Sub-admin rights updated successfully!', 'success');
      setPermModalOpen(false);
      fetchSubAdmins();
    } catch (err) {
      showToast('Failed to save permissions matrix.', 'error');
    } finally {
      setSavingPerms(false);
    }
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin account?')) return;
    try {
      await adminAPI.delete(`/api/admin/sub-admins/${id}`);
      showToast('Sub-Admin account deleted.', 'success');
      fetchSubAdmins();
    } catch (err) {
      showToast('Failed to delete sub-admin.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Toast Banner */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center space-x-3 text-xs font-semibold animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-600'
              : 'bg-emerald-950 text-emerald-200 border-emerald-500'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ------------------- 1. HEADER SECTION ------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Sub-Admin RBAC Governance</h1>
            <p className="text-xs text-[#A397C7]">
              Create sub-administrator accounts and assign granular CRUD permissions per module
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#FF5A1F]/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create Sub-Admin</span>
        </button>
      </div>

      {/* ------------------- 2. SUB-ADMINS TABLE ------------------- */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span>Loading sub-admin records...</span>
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="p-12 text-center text-[#A397C7] text-xs space-y-3">
            <Shield className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="font-semibold text-white">No Sub-Admin Accounts Created</p>
            <p className="text-[11px]">Click "+ Create Sub-Admin" above to add staff accounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0326]/80 text-[#A397C7] border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Sub-Admin</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Active Rights Summary</th>
                  <th className="py-4 px-4">Created Date</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-200">
                {subAdmins.map((sub) => {
                  const perms = sub.permissions || {};
                  const activeModulesCount = Object.keys(perms).filter(
                    (k) => perms[k]?.read || perms[k]?.update || perms[k]?.delete
                  ).length;

                  return (
                    <tr key={sub._id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-700/50 text-[#FF5A1F] flex items-center justify-center font-bold">
                            {sub.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{sub.username}</p>
                            <p className="text-[10px] text-purple-400">{sub.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-purple-900/40 text-purple-200 border border-purple-800/40">
                          {sub.role || 'sub-admin'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {activeModulesCount === 0 ? (
                          <span className="text-[11px] text-rose-400 italic">No permissions assigned (0 Modules)</span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            Allowed access to {activeModulesCount} module(s)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-purple-400 text-[11px]">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-4 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenPermModal(sub)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Permissions Matrix</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSubAdmin(sub._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[11px] inline-flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------- 3. CREATE SUB-ADMIN MODAL ------------------- */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B0326] border border-purple-800/60 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#FF5A1F]" />
                <h3 className="text-base font-bold text-white">Create New Sub-Admin</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newSubAdmin.username}
                  onChange={(e) => setNewSubAdmin({ ...newSubAdmin, username: e.target.value })}
                  placeholder="e.g. subadmin_john"
                  className="w-full px-3.5 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newSubAdmin.email}
                  onChange={(e) => setNewSubAdmin({ ...newSubAdmin, email: e.target.value })}
                  placeholder="e.g. john@globalprofithub.com"
                  className="w-full px-3.5 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  value={newSubAdmin.password}
                  onChange={(e) => setNewSubAdmin({ ...newSubAdmin, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold shadow-lg"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- 4. PERMISSIONS MATRIX MODAL ------------------- */}
      {permModalOpen && selectedSubAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B0326] border border-purple-800/60 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative custom-scrollbar">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#FF5A1F]" />
                  <span>Module Permission Matrix</span>
                </h3>
                <p className="text-xs text-purple-400">
                  Target Account: <span className="font-bold text-white">{selectedSubAdmin.username}</span> ({selectedSubAdmin.email})
                </p>
              </div>

              <button
                onClick={() => setPermModalOpen(false)}
                className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Grid Table */}
            <div className="border border-purple-900/40 rounded-2xl overflow-hidden bg-[#07021A]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B0326] text-purple-300 border-b border-purple-900/40 font-semibold uppercase">
                    <th className="py-3 px-4">System Module</th>
                    <th className="py-3 px-4 text-center">Read Rights</th>
                    <th className="py-3 px-4 text-center">Update Rights</th>
                    <th className="py-3 px-4 text-center">Delete Rights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {MODULE_LIST.map((mod) => {
                    const IconComp = mod.icon;
                    const modPerms = permissionsMatrix[mod.id] || { read: false, update: false, delete: false };

                    return (
                      <tr key={mod.id} className="hover:bg-purple-900/10">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2.5">
                          <IconComp className="w-4 h-4 text-[#FF5A1F]" />
                          <span>{mod.label}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={modPerms.read}
                            onChange={() => handleCheckboxChange(mod.id, 'read')}
                            className="w-4 h-4 accent-[#FF5A1F] rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={modPerms.update}
                            onChange={() => handleCheckboxChange(mod.id, 'update')}
                            className="w-4 h-4 accent-[#FF5A1F] rounded cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={modPerms.delete}
                            onChange={() => handleCheckboxChange(mod.id, 'delete')}
                            className="w-4 h-4 accent-[#FF5A1F] rounded cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPermModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-purple-950 text-purple-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={savingPerms}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingPerms ? 'Saving Matrix...' : 'Save Permissions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubAdmins;
