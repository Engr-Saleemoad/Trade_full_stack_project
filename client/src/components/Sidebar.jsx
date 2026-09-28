import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  LayoutDashboard,
  Award,
  ListOrdered,
  PlusCircle,
  History,
  Send,
  Receipt,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

export const Sidebar = ({ activeTab, handleTabChange }) => {
  const { user } = useAuth();

  const mainBalanceFormatted = user?.mainBalance !== undefined && user?.mainBalance !== null
    ? `$${Number(user.mainBalance).toFixed(2)}`
    : '$0.00';

  const interestBalanceFormatted = user?.interestBalance !== undefined && user?.interestBalance !== null
    ? `$${Number(user.interestBalance).toFixed(2)}`
    : '$0.00';

  const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Plan', icon: Award },
    { name: 'Task', icon: ListOrdered },
    { name: 'Add Fund', icon: PlusCircle },
    { name: 'Fund History', icon: History },
    { name: 'Transfer', icon: Send },
    { name: 'Transaction', icon: Receipt },
    { name: 'Payout', icon: ArrowUpRight },
    { name: 'Payout History', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-[#0B0326] border-r border-purple-900/30 flex-col justify-between shrink-0 hidden lg:flex">
      <div>
        {/* Top Sidebar Header Logo */}
        <div className="h-20 flex items-center px-6 border-b border-purple-900/30 space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-md shadow-[#FF5A1F]/30">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-base font-black tracking-tight text-white leading-none">
            GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
          </span>
        </div>

        {/* Dynamic Account Balance Widget */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-[#140838] border border-purple-900/40 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#A397C7] tracking-wider block">
            Account Balance USD
          </span>
          <div className="text-xs space-y-1 font-semibold text-slate-200">
            <p className="flex justify-between">
              <span className="text-[#A397C7]">Main Balance:</span>
              <span className="text-[#FF5A1F] font-bold">{mainBalanceFormatted}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[#A397C7]">Interest Balance:</span>
              <span className="text-emerald-400 font-bold">{interestBalanceFormatted}</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => handleTabChange && handleTabChange('Add Fund')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-[11px] text-center shadow-md transition-all cursor-pointer"
            >
              Deposit
            </button>
            <button
              onClick={() => handleTabChange && handleTabChange('Plan')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-[11px] text-center shadow-md transition-all cursor-pointer"
            >
              Invest
            </button>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="px-3 space-y-1">
          {navLinks.map((link, idx) => {
            const IconComp = link.icon;
            const isActive = activeTab === link.name;
            return (
              <button
                key={idx}
                onClick={() => handleTabChange && handleTabChange(link.name)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30'
                    : 'text-[#A397C7] hover:text-white hover:bg-purple-950/40'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF5A1F]'}`} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Return Link */}
      <div className="p-4 border-t border-purple-900/30">
        <Link
          to="/"
          className="flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-xs font-semibold text-slate-300 border border-purple-800/40 transition-all"
        >
          <span>Return to Main Website</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
