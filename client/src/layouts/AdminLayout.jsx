import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminErrorBoundary } from '../components/AdminErrorBoundary';
import {
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Award,
  Users,
  Receipt,
  TrendingUp,
  Percent,
  CreditCard,
  ArrowUpRight,
  Sliders,
  Inbox,
  FileText,
  Settings,
  Bell,
  Search,
  LogOut,
  Megaphone,
  Send,
  Laptop,
} from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, moduleKey: 'dashboard' },
    { name: 'All Users', path: '/admin/users', icon: Users, moduleKey: 'users' },
    { name: 'Sub-Admins & RBAC', path: '/admin/sub-admins', icon: ShieldCheck, moduleKey: 'sub-admins' },
    { name: 'User Device Details', path: '/admin/device-logs', icon: Laptop, moduleKey: 'device_logs' },
    { name: 'Deposit Requests', path: '/admin/deposit-request', icon: Inbox, moduleKey: 'deposits' },
    { name: 'Payout Requests', path: '/admin/payout-request', icon: ArrowUpRight, moduleKey: 'payouts' },
    { name: 'Payout Logs', path: '/admin/payout-log', icon: FileText, moduleKey: 'payouts' },
    { name: 'Investments', path: '/admin/investments', icon: TrendingUp, moduleKey: 'investments' },
    { name: 'Notice Board', path: '/admin/notices', icon: Megaphone, moduleKey: 'notices' },
    { name: 'Plan List', path: '/admin/plans', icon: Award, moduleKey: 'plans' },
    { name: 'Referral System', path: '/admin/referral', icon: Percent, moduleKey: 'referrals' },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt, moduleKey: 'transactions' },
    { name: 'Transfer Requests', path: '/admin/transfer-requests', icon: Send, moduleKey: 'transfers' },
    { name: 'System Settings', path: '/admin/settings', icon: Settings, moduleKey: 'settings' },
  ];

  const adminUserStr = localStorage.getItem('adminUser');
  let adminUser = null;
  try {
    adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;
  } catch (e) {
    adminUser = null;
  }

  const isMasterAdmin = !adminUser || adminUser.role === 'admin';

  const visibleNavItems = allNavItems.filter((item) => {
    if (isMasterAdmin) return true;
    if (item.moduleKey === 'dashboard') return true;
    if (item.moduleKey === 'sub-admins') return false;

    const perm = adminUser?.permissions?.[item.moduleKey];
    if (typeof perm === 'boolean') return perm;
    if (perm && typeof perm === 'object') return perm.read === true;
    return false;
  });

  return (
    <div className="min-h-screen flex bg-[#07021A] text-white font-sans selection:bg-[#FF5A1F] selection:text-white relative">
      {/* ------------------- 1. DEEP DARK PURPLE SIDEBAR MODULE (DESKTOP) ------------------- */}
      <aside className="w-64 bg-[#0B0326] border-r border-purple-900/30 flex flex-col justify-between shrink-0 hidden lg:flex">
        <div>
          {/* Top Brand Header */}
          <div className="h-20 flex items-center px-6 border-b border-purple-900/30 space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-md shadow-[#FF5A1F]/30">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-base font-black tracking-tight text-white leading-none">
              GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
            </span>
          </div>

          {/* List Items */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {visibleNavItems.map((item, idx) => {
              const IconComp = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMenu(item.name);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30'
                      : 'text-[#A397C7] hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF5A1F]'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Logout Action */}
        <div className="p-4 border-t border-purple-900/30">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ------------------- MOBILE OVERLAY SIDEBAR DRAWER ------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#0B0326] border-r border-purple-900/40 flex flex-col justify-between h-full z-10 p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-4 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] flex items-center justify-center text-white">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-white">ADMIN PORTAL</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-purple-950 text-purple-300"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                {visibleNavItems.map((item, idx) => {
                  const IconComp = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveMenu(item.name);
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FF5A1F] text-white'
                          : 'text-[#A397C7] hover:bg-purple-950/40'
                      }`}
                    >
                      <IconComp className="w-4 h-4 text-[#FF5A1F]" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------- 2. MAIN HEADER & WORKSPACE ------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Navigation Header */}
        <header className="h-20 bg-[#0B0326]/90 backdrop-blur-md border-b border-purple-900/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left Search Bar & Mobile Menu Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#07021A] border border-purple-800/40 text-purple-300"
            >
              ☰
            </button>
            <div className="relative w-48 sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                placeholder="Search portal..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>
          </div>

          {/* Right Admin Avatar & Sign Out Button */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-purple-500/50 shadow-md">
                AD
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-white">Hello, admin</p>
                <p className="text-[10px] text-[#FF5A1F] font-semibold">Super Administrator</p>
              </div>
            </div>

            <div className="h-6 w-px bg-purple-900/40" />

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Viewport Content wrapped in Error Boundary */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-[#07021A]">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};

