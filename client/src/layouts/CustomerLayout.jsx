import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Home, LayoutDashboard, Globe, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Customer Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-amber-600 flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 border border-[#FF5A1F]/40">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white leading-none">
                GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-2 sm:space-x-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold transition-all shadow-md"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Customer Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© 2026 Full-Stack App Boilerplate. Built with Express & React Vite.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">API Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
