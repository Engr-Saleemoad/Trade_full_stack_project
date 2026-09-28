import React, { useState, useEffect } from 'react';
import adminAPI from '../api/adminAxios';
import { getImageUrl } from '../utils/imageUrl';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

export const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    isActive: true,
    image: null,
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const showToastNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/api/admin/notices');
      if (res.data && res.data.data) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      showToastNotification('Failed to load notices from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      description: '',
      priority: 'Normal',
      isActive: true,
      image: null,
      imageUrl: '',
    });
    setImagePreview('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      description: notice.description || '',
      priority: notice.priority || 'Normal',
      isActive: notice.isActive !== false,
      image: null,
      imageUrl: notice.imageUrl || '',
    });
    setImagePreview(notice.imageUrl || '');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToastNotification("File size must not exceed 1MB", "error");
        e.target.value = null;
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToastNotification('Please fill in required Notice Title and Description.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const body = new FormData();
      body.append('title', formData.title.trim());
      body.append('description', formData.description.trim());
      body.append('priority', formData.priority);
      body.append('isActive', formData.isActive);

      if (formData.image) {
        body.append('image', formData.image);
      } else if (formData.imageUrl) {
        body.append('imageUrl', formData.imageUrl);
      }

      let res;
      if (editingNotice) {
        res = await adminAPI.put(`/api/admin/notices/${editingNotice._id}`, body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToastNotification(res.data?.message || 'Notice updated successfully!');
      } else {
        res = await adminAPI.post('/api/admin/notices', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToastNotification(res.data?.message || 'Notice announcement published!');
      }

      setModalOpen(false);
      fetchNotices();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Operation failed.';
      showToastNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (notice) => {
    try {
      const res = await adminAPI.patch(`/api/admin/notices/${notice._id}/toggle`);
      const updatedNotice = res.data?.data;
      
      // Update local state instantly for zero lag UI
      setNotices((prev) =>
        prev.map((n) =>
          n._id === notice._id ? { ...n, isActive: !n.isActive } : n
        )
      );

      const statusLabel = updatedNotice
        ? updatedNotice.isActive
          ? 'Active'
          : 'Inactive'
        : !notice.isActive
        ? 'Active'
        : 'Inactive';

      showToastNotification(`Notice status updated to ${statusLabel}`, 'success');
    } catch (err) {
      console.error('Failed to toggle notice status:', err);
      showToastNotification('Failed to toggle notice status.', 'error');
    }
  };

  const handleConfirmDelete = (notice) => {
    setNoticeToDelete(notice);
    setDeleteModalOpen(true);
  };

  const executeDeleteNotice = async () => {
    if (!noticeToDelete) return;
    try {
      await adminAPI.delete(`/api/admin/notices/${noticeToDelete._id}`);
      setNotices((prev) => prev.filter((n) => n._id !== noticeToDelete._id));
      showToastNotification('Notice deleted permanently!', 'success');
    } catch (err) {
      showToastNotification('Failed to delete notice.', 'error');
    } finally {
      setDeleteModalOpen(false);
      setNoticeToDelete(null);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'Important':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Toast Notification Banner */}
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

      {/* Top Bar Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Notice Board Manager</h1>
            <p className="text-xs text-[#A397C7]">
              Manage global investor announcements, login popups, and banners
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-[#FF5A1F]/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Notice</span>
        </button>
      </div>

      {/* Main Notices Data Table */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span>Loading Notice Board records...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center text-[#A397C7] text-xs space-y-3">
            <Bell className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="font-semibold text-white">No Notices Published Yet</p>
            <p className="text-[11px]">Click "+ Add New Notice" above to broadcast an announcement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0326]/80 text-[#A397C7] border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Image Banner</th>
                  <th className="py-4 px-4">Title</th>
                  <th className="py-4 px-4 min-w-[200px]">Description</th>
                  <th className="py-4 px-4">Priority Tag</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-200">
                {notices.map((notice) => (
                  <tr key={notice._id} className="hover:bg-purple-900/10 transition-colors">
                    {/* Column 1: Image Banner */}
                    <td className="py-4 px-4 shrink-0">
                      {notice.imageUrl ? (
                        <img
                          src={getImageUrl(notice.imageUrl)}
                          alt={notice.title}
                          className="w-16 h-10 object-cover rounded-lg border border-purple-800/40 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=60';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-10 bg-purple-950/80 border border-purple-800/40 rounded-lg flex items-center justify-center text-purple-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    {/* Column 2: Title */}
                    <td className="py-4 px-4 font-bold text-white max-w-[180px] truncate">
                      {notice.title}
                    </td>

                    {/* Column 3: Description */}
                    <td className="py-4 px-4 text-purple-300 max-w-[280px] truncate">
                      {notice.description}
                    </td>

                    {/* Column 4: Priority Tag */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${getPriorityBadgeClass(
                          notice.priority
                        )}`}
                      >
                        {notice.priority || 'Normal'}
                      </span>
                    </td>

                    {/* Column 5: Status Toggle Switch */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(notice)}
                        className="flex items-center space-x-2 cursor-pointer group focus:outline-none"
                        title="Click to toggle display on user dashboard"
                      >
                        {notice.isActive ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400 group-hover:scale-105 transition-transform" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-slate-500 group-hover:scale-105 transition-transform" />
                        )}
                        <span
                          className={`font-semibold text-[11px] ${
                            notice.isActive ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {notice.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>

                    {/* Column 6: Date */}
                    <td className="py-4 px-4 text-[#A397C7] text-[11px] whitespace-nowrap">
                      {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(notice)}
                          className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-purple-200 hover:text-white transition-colors cursor-pointer"
                          title="Edit Notice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(notice)}
                          className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/40 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                          title="Delete Notice"
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
        )}
      </div>

      {/* ------------------- CREATE / EDIT MODAL DRAWER ------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140838] border border-purple-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn relative">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0B0326] border-b border-purple-900/40 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                <span>{editingNotice ? 'Edit Announcement' : 'Publish New Notice'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-purple-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNotice} className="p-6 space-y-4 text-xs">
              {/* Field 1: Title */}
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">
                  Notice Title <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., System Upgrade Notice or Holiday Bonus"
                  className="w-full px-3.5 py-2.5 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Field 2: Priority Dropdown */}
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                >
                  <option value="Normal">Normal (Blue)</option>
                  <option value="Important">Important (Yellow)</option>
                  <option value="Urgent">Urgent (Red)</option>
                </select>
              </div>

              {/* Field 3: Description */}
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">
                  Message Body / Description <span className="text-[#FF5A1F]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed notice information to present to active users..."
                  className="w-full px-3.5 py-2.5 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              {/* Field 4: Banner Image Upload */}
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">Banner Image Banner</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-[11px] text-purple-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FF5A1F]/20 file:text-[#FF5A1F] hover:file:bg-[#FF5A1F]/30 cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Thumbnail Preview"
                      className="w-full h-24 object-cover rounded-xl border border-purple-800/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image: null, imageUrl: '' });
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Field 5: Active Toggle Switch */}
              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-white font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0B0326] border-purple-800 text-[#FF5A1F] focus:ring-0 cursor-pointer"
                  />
                  <span>Show immediately to users on login (Active Status)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold tracking-wide shadow-lg shadow-[#FF5A1F]/30 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publishing...' : editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- DELETE CONFIRMATION MODAL ------------------- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140838] border border-purple-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Announcement?</h3>
              <p className="text-xs text-[#A397C7] mt-1">
                Are you sure you want to permanently delete "{noticeToDelete?.title}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteNotice}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticeBoard;
