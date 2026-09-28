import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  User,
  Shield,
  Mail,
  Phone,
  Globe,
  Copy,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Key,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    country: '',
    phone: '',
    status: 'Active',
    referralUrl: '',
    createdAt: '',
  });

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/profile');
      if (res.data && res.data.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      // Fallback: decode local user if API delay
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          setProfile({
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Investor',
            username: u.username || 'investor',
            email: u.email || 'investor@example.com',
            country: u.country || 'Afghanistan (+93)',
            phone: u.phone || 'N/A',
            status: u.status || 'Active',
            referralUrl: `https://globalprofithub.co.uk/register/${u.username || 'investor'}`,
            createdAt: u.createdAt || new Date().toISOString(),
          });
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleCopyReferral = () => {
    const urlToCopy = profile.referralUrl || `https://globalprofithub.co.uk/register/${profile.username}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please complete all password fields.', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmittingPassword(true);

    try {
      const res = await API.post('/api/user/change-password', passwordForm);
      showToast(res.data?.message || 'Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Password update failed.';
      showToast(msg, 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0426] via-[#08021A] to-[#050112] text-white p-4 sm:p-8 font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* Dynamic Toast Overlay */}
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

      {/* Top Header Navigation */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-semibold text-[#A397C7] hover:text-[#FF5A1F] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-bold text-[#FF5A1F] px-3 py-1 bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 rounded-full">
          Verified Account
        </span>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Banner Card */}
        <div className="bg-gradient-to-r from-[#170A3D] to-[#0E0426] border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A1F]/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex items-center space-x-5 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-amber-500 text-white font-black text-2xl flex items-center justify-center border-2 border-purple-500/40 shadow-xl shadow-[#FF5A1F]/20">
              {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>{profile.fullName || profile.username || 'Investor Profile'}</span>
                <Sparkles className="w-5 h-5 text-[#FF5A1F]" />
              </h1>
              <p className="text-xs text-[#A397C7]">
                Member since:{' '}
                <strong className="text-white">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'July 2026'}
                </strong>
              </p>
            </div>
          </div>

          <div className="z-10 flex items-center space-x-3 bg-purple-950/60 border border-purple-800/40 px-4 py-2.5 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-[#A397C7] block text-[10px] uppercase font-semibold">Account Status</span>
              <span className="text-emerald-400 font-bold">{profile.status || 'Active'}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: User Details & Password Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Read-Only User Details */}
          <div className="bg-[#140838]/90 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-purple-900/40 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-[#FF5A1F]" />
                <span>Personal Account Details</span>
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">Full Name</label>
                <div className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white font-medium">
                  {profile.fullName || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">Username</label>
                <div className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white font-mono font-medium">
                  @{profile.username || 'investor'}
                </div>
              </div>

              <div>
                <label className="block text-[#A397C7] font-semibold mb-1">Email Address</label>
                <div className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white flex items-center justify-between">
                  <span>{profile.email || 'investor@globalprofithub.com'}</span>
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A397C7] font-semibold mb-1">Country</label>
                  <div className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white">
                    {profile.country || 'Afghanistan (+93)'}
                  </div>
                </div>
                <div>
                  <label className="block text-[#A397C7] font-semibold mb-1">Phone Number</label>
                  <div className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white">
                    {profile.phone || '+1234567890'}
                  </div>
                </div>
              </div>

              {/* Referral Copy Section */}
              <div className="pt-2">
                <label className="block text-[#A397C7] font-semibold mb-1">Unique Referral Invitation Link</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={profile.referralUrl || `https://globalprofithub.co.uk/register/${profile.username}`}
                    className="w-full px-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-l-xl text-xs text-[#FF5A1F] font-mono focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className="px-4 py-3 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold rounded-r-xl transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Security & Password Settings */}
          <div className="bg-[#140838]/90 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-purple-900/40 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#FF5A1F]" />
                <span>Security & Password Settings</span>
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 text-xs">
              <div>
                <label className="block text-[#A397C7] font-semibold mb-1.5">
                  Current Password <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white placeholder:text-purple-400/30 focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A397C7] font-semibold mb-1.5">
                  New Password <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white placeholder:text-purple-400/30 focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A397C7] font-semibold mb-1.5">
                  Confirm New Password <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0326] border border-purple-900/50 rounded-xl text-white placeholder:text-purple-400/30 focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
