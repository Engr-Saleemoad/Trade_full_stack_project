import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/admin/notices', icon: Megaphone },
    { name: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck },
    { name: 'Plan List', path: '/admin/plans', icon: Award },
    { name: 'Referral', path: '/admin/referral', icon: Users },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
    { name: 'Investments', path: '/admin/investments', icon: TrendingUp },
    { name: 'Commissions', path: '/admin/commissions', icon: Percent },
    { name: 'All Users', path: '/admin/users', icon: Users },
    { name: 'Payment Methods', path: '/admin/payment-methods', icon: CreditCard },
    { name: 'Payout', path: '/admin/payout', icon: ArrowUpRight },
    { name: 'Manual Gateway', path: '/admin/manual-gateway', icon: Sliders },
    { name: 'Deposit Request', path: '/admin/deposit-request', icon: Inbox },
    { name: 'Payment Log', path: '/admin/payment-log', icon: FileText },
    { name: 'Payout Methods', path: '/admin/payout-methods', icon: CreditCard },
    { name: 'Payout Settings', path: '/admin/payout-settings', icon: Settings },
    { name: 'Payout Request', path: '/admin/payout-request', icon: Inbox },
    { name: 'Payout Log', path: '/admin/payout-log', icon: FileText },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Notifications', path: '/admin/notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-[#07021A] text-white font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* ------------------- 1. DEEP DARK PURPLE SIDEBAR MODULE ------------------- */}
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

          {/* List Items (18 Links) */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {adminNavItems.map((item, idx) => {
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

      {/* ------------------- 2. MAIN HEADER & WORKSPACE ------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Navigation Header */}
        <header className="h-20 bg-[#0B0326]/90 backdrop-blur-md border-b border-purple-900/30 px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left Search Bar ("Search...") */}
          <div className="relative w-64 sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
            />
          </div>

          {/* Right Admin Avatar & Bell Alert */}
          <div className="flex items-center space-x-5">
            {/* Bell Alert Icon showing count '1' */}
            <button className="relative p-2.5 rounded-xl bg-[#140838] border border-purple-900/40 text-purple-300 hover:text-white transition-all cursor-pointer">
              <Bell className="w-5 h-5 text-purple-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5A1F] text-[#0B0326] font-extrabold text-[10px] flex items-center justify-center border-2 border-[#0B0326]">
                1
              </span>
            </button>

            <div className="h-6 w-px bg-purple-900/40" />

            {/* Admin Indicator: "Hello, admin" + Avatar Circle */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-purple-500/50 shadow-md">
                AD
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-white">Hello, admin</p>
                <p className="text-[10px] text-[#FF5A1F] font-semibold">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-[#07021A]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
