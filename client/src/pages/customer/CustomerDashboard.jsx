import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardStatsApi } from '../../services/api';
import { listenToRealtimeEvents } from '../../services/socket';
import { InvestmentPlansView } from './InvestmentPlansView';
import { AddFundView } from './AddFundView';
import { FundHistoryView } from './FundHistoryView';
import { PayoutView } from './PayoutView';
import { PayoutHistoryView } from './PayoutHistoryView';
import { TaskInvestHistoryView } from './TaskInvestHistoryView';
import { TransactionHistoryView } from './TransactionHistoryView';
import { TransferView } from './TransferView';
import { NoticeModal } from '../../components/NoticeModal';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
  Bell,
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  Gift,
  Copy,
  CheckCircle2,
  Ticket,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedPlanForDeposit, setSelectedPlanForDeposit] = useState(null);

  const [stats, setStats] = useState({
    username: 'investor',
    mainBalance: 0,
    interestBalance: 0,
    totalDeposit: 0,
    totalEarn: 0,
    totalInvest: 0,
    totalPayout: 0,
    totalReferralBonus: 0,
    totalTickets: 0,
    lastReferralBonus: 0,
    referralUrl: 'https://globalprofithub.co.uk/register/investor',
    investCompletedPercent: 0,
    roiSpeedPercent: 100,
    roiRedeemedPercent: 0,
    chartData: [
      { month: 'Jan', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Feb', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Mar', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Apr', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'May', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Jun', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Jul', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Aug', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Sep', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Oct', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Nov', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
      { month: 'Dec', investment: 0, payout: 0, deposit: 0, depositBonus: 0, investmentBonus: 0 },
    ],
  });

  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchDashboardStatsApi();
        if (res.data) {
          setStats((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        console.warn('[Dashboard] Using fallback stats:', err.message);
      }
    };

    loadStats();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (
        event === 'deposit_updated' ||
        event === 'payout_updated' ||
        event === 'balance_updated' ||
        event === 'user_updated'
      ) {
        loadStats();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(stats.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTabChange = (tabName) => {
    if (tabName === 'Add Fund') {
      setSelectedPlanForDeposit(null);
    }
    setActiveTab(tabName);
    setMobileDrawerOpen(false);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanForDeposit(plan);
    setActiveTab('Add Fund');
    setMobileDrawerOpen(false);
  };

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

  const mainBal = Number(user?.mainBalance ?? stats.mainBalance ?? 0);
  const interestBal = Number(user?.interestBalance ?? stats.interestBalance ?? 0);

  const metricCards = [
    { label: 'Main Balance', value: `$${mainBal.toFixed(2)}`, icon: Wallet },
    { label: 'Interest Balance', value: `$${interestBal.toFixed(2)}`, icon: DollarSign },
    { label: 'Total Deposit', value: `$${Number(user?.totalDeposit ?? stats.totalDeposit ?? 0).toFixed(2)}`, icon: CreditCard },
    { label: 'Total Earn', value: `$${Number(user?.totalEarn ?? stats.totalEarn ?? 0).toFixed(2)}`, icon: TrendingUp },
    { label: 'Total Invest', value: `$${Number(user?.totalInvest ?? stats.totalInvest ?? 0).toFixed(2)}`, icon: Award },
    { label: 'Total Payout', value: `$${Number(user?.totalPayout ?? stats.totalPayout ?? 0).toFixed(2)}`, icon: ArrowUpRight },
    { label: 'Total Referral Bonus', value: `$${Number(user?.totalReferralBonus ?? stats.totalReferralBonus ?? 0).toFixed(2)}`, icon: Gift },
    { label: 'Total Ticket', value: `${stats.totalTickets || 0}`, icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-[#07021A] text-white flex font-sans selection:bg-[#FF5A1F] selection:text-white overflow-x-hidden">
      {/* Customer Login Announcement Popup Modal */}
      <NoticeModal />

      {/* ------------------- 1. MASTER DESKTOP SIDEBAR ------------------- */}
      <Sidebar activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* ------------------- MOBILE OFF-CANVAS SIDEBAR DRAWER (< 1024px) ------------------- */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
          />

          <aside className="relative w-72 bg-[#0B0326] border-r border-purple-800/40 h-full flex flex-col justify-between p-4 z-50 animate-slideInLeft overflow-y-auto">
            <div>
              <div className="h-16 flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-white">
                    GLOBAL <span className="text-[#FF5A1F]">PROFIT</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl bg-purple-950 text-purple-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Account Balance Widget */}
              <div className="p-3 my-4 rounded-xl bg-[#140838] border border-purple-900/40 space-y-1.5 text-xs">
                <p className="flex justify-between">
                  <span className="text-[#A397C7]">Main:</span>
                  <span className="text-[#FF5A1F] font-bold">${mainBal.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#A397C7]">Interest:</span>
                  <span className="text-emerald-400 font-bold">${interestBal.toFixed(2)}</span>
                </p>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                {navLinks.map((link, idx) => {
                  const IconComp = link.icon;
                  const isActive = activeTab === link.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTabChange(link.name)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

            <div className="pt-4 border-t border-purple-900/40">
              <Link
                to="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 text-center rounded-xl bg-purple-950 text-xs font-bold text-slate-200 block"
              >
                Return to Website
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ------------------- MAIN PANEL VIEWPORT ------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sm:h-20 bg-[#0B0326]/90 backdrop-blur-md border-b border-purple-900/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button on Mobile (< 1024px) */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-200 hover:text-white transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open Sidebar Menu"
            >
              ☰
            </button>

            <h1 className="text-sm sm:text-lg font-bold text-white truncate max-w-[180px] sm:max-w-none">
              {activeTab === 'Plan'
                ? 'Investment Plans'
                : activeTab === 'Task'
                ? 'Daily ROI Claims'
                : activeTab === 'Add Fund'
                ? 'Add Fund'
                : activeTab === 'Fund History'
                ? 'Fund History'
                : activeTab === 'Transaction'
                ? 'Transaction Ledger'
                : activeTab === 'Payout'
                ? 'Payout Gateways'
                : activeTab === 'Payout History'
                ? 'Payout History'
                : 'Dashboard Overview'}
            </h1>
          </div>

          {/* Extreme Right Bell & Avatar */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Bell Icon */}
            <button className="relative p-2 rounded-xl bg-[#140838] border border-purple-900/40 text-slate-300 hover:text-white transition-all">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5A1F] text-[#0B0326] font-extrabold text-[10px] flex items-center justify-center border-2 border-[#0B0326]">
                1
              </span>
            </button>

            <div className="h-5 w-px bg-purple-900/40" />

            {/* Circular Profile Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group bg-transparent border-0 text-left focus:outline-none"
              title="Manage Profile & Security"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-600 to-[#FF5A1F] text-white font-black text-xs flex items-center justify-center border-2 border-purple-500/50 shadow-md group-hover:scale-105 transition-transform">
                {stats.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-white capitalize group-hover:text-[#FF5A1F] transition-colors">{stats.username}</p>
                <p className="text-[10px] text-emerald-400">Investor</p>
              </div>
            </button>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto bg-[#07021A]">
          {activeTab === 'Plan' ? (
            <InvestmentPlansView onSelectPlan={handleSelectPlan} />
          ) : activeTab === 'Task' ? (
            <TaskInvestHistoryView
              onBuyPlanClick={() => setActiveTab('Plan')}
              onRewardClaimed={(newInterestBalance) => {
                setStats((prev) => ({ ...prev, interestBalance: newInterestBalance }));
              }}
            />
          ) : activeTab === 'Add Fund' ? (
            <AddFundView selectedPlan={selectedPlanForDeposit} />
          ) : activeTab === 'Fund History' ? (
            <FundHistoryView />
          ) : activeTab === 'Transfer' ? (
            <TransferView onTransferSuccess={() => { refreshUserData && refreshUserData(); }} />
          ) : activeTab === 'Transaction' ? (
            <TransactionHistoryView />
          ) : activeTab === 'Payout' ? (
            <PayoutView onNavigateToHistory={() => setActiveTab('Payout History')} />
          ) : activeTab === 'Payout History' ? (
            <PayoutHistoryView />
          ) : (
            <>
              {/* ------------------- 2. METRICS CARDS GRID (2 cols on mobile, 4 on desktop) ------------------- */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {metricCards.map((card, idx) => {
                  const IconComp = card.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-[#130833]/90 border border-purple-900/40 border-l-4 border-l-[#FF5A1F] p-3.5 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between hover:border-purple-800/60 transition-all group"
                    >
                      <div className="space-y-0.5 sm:space-y-1">
                        <span className="text-[10px] sm:text-xs font-semibold text-[#A397C7] uppercase tracking-wider block truncate">
                          {card.label}
                        </span>
                        <p className="text-base sm:text-2xl font-black text-white group-hover:text-[#FF5A1F] transition-colors truncate">
                          {card.value}
                        </p>
                      </div>
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
                        <IconComp className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* ------------------- 3. DATA VISUALIZATION & ANALYTICS SECTION ------------------- */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Analytics Box: 12-Month Line Chart */}
                <div className="lg:col-span-2 bg-[#130833]/90 border border-purple-900/40 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      12-Month Performance Analytics
                    </h2>
                    <span className="text-xs text-[#A397C7] font-mono">Jan - Dec</span>
                  </div>

                  {/* Line Chart Component */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#261254" />
                        <XAxis dataKey="month" stroke="#A397C7" fontSize={11} />
                        <YAxis stroke="#A397C7" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B0326', borderColor: '#4C1D95', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="investment" stroke="#6366f1" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="payout" stroke="#FF5A1F" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="deposit" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="depositBonus" stroke="#a855f7" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="investmentBonus" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Multi-colored Custom Legend Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-purple-900/30 text-xs font-medium">
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span>Investment</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
                      <span>Payout</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Deposit</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Deposit Bonus</span>
                    </span>
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span>Investment Bonus</span>
                    </span>
                  </div>
                </div>

                {/* Right Analytics Box: 3 Circular SVG Radial Gauges */}
                <div className="bg-[#130833]/90 border border-purple-900/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="border-b border-purple-900/30 pb-3">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">ROI & Yield Status</h2>
                  </div>

                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                    {/* Radial Gauge 1: Invest Completed */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-purple-950 stroke-current"
                            strokeWidth="3.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-white">0 %</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Invest Completed</h3>
                        <p className="text-[11px] text-[#A397C7]">Active plan yield cycle status</p>
                      </div>
                    </div>

                    {/* Radial Gauge 2: ROI Speed */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-purple-950 stroke-current"
                            strokeWidth="3.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-400 stroke-current"
                            strokeDasharray="100, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-emerald-400">100 %</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">ROI Speed</h3>
                        <p className="text-[11px] text-emerald-400 font-medium">Optimal yield generation speed</p>
                      </div>
                    </div>

                    {/* Radial Gauge 3: ROI Redeemed */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-purple-950 stroke-current"
                            strokeWidth="3.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-white">0 %</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">ROI Redeemed</h3>
                        <p className="text-[11px] text-[#A397C7]">Total profit claimed into balance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ------------------- 4. BOTTOM REFERRAL PANEL ------------------- */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Card: The Last Referral Bonus */}
                <div className="bg-[#130833]/90 border border-purple-900/40 rounded-2xl p-6 shadow-xl flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
                    <Gift className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#A397C7] uppercase tracking-wider block">
                      The Last Referral Bonus
                    </span>
                    <p className="text-3xl font-black text-white">${stats.lastReferralBonus}</p>
                  </div>
                </div>

                {/* Right Component: Referral Link Box */}
                <div className="md:col-span-2 bg-[#130833]/90 border border-purple-900/40 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-[#A397C7] uppercase tracking-wider block">
                    Referral Link
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      readOnly
                      value={stats.referralUrl}
                      className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white font-mono focus:outline-none"
                    />

                    <button
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>COPY LINK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
