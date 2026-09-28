import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Zap,
  Users,
  CreditCard,
  Lock,
  Headphones,
  ArrowRight,
  Play,
  Quote,
  CheckCircle2,
  Calendar,
  Globe,
  TrendingUp,
  Award,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  X,
  Menu,
  RefreshCw,
  User
} from 'lucide-react';

export const GlobalProfitHub = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user || localStorage.getItem('token'));
  const [videoOpen, setVideoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await API.get('/api/plans');
        setPlans(res.data.plans || res.data.data || []);
      } catch (err) {
        console.error("Error loading plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  const features = [
    {
      title: 'Expert Management',
      desc: 'Professional fund managers monitoring digital asset markets around the clock to optimize structural portfolio allocation.',
      icon: Users,
    },
    {
      title: 'Registered Company',
      desc: 'Fully certified corporate entity complying with global financial auditing standards and strict regulatory safeguards.',
      icon: Shield,
    },
    {
      title: 'Secure Wallet',
      desc: 'Multi-signature cold storage wallet protection ensuring 100% offline asset isolation and zero counterparty risk.',
      icon: Lock,
    },
    {
      title: '24/7 Security',
      desc: 'Enterprise-grade DDoS protection, real-time transaction monitoring, and encrypted TLS data transport.',
      icon: Headphones,
    },
    {
      title: 'Instant Withdrawal',
      desc: 'Automated instant payout processing directly to your preferred cryptocurrency wallet with zero hidden delays.',
      icon: Zap,
    },
    {
      title: 'Referral Program',
      desc: 'Multi-tiered affiliate incentives rewarding community growth with instant commissions on referral deposits.',
      icon: TrendingUp,
    },
  ];

  const steps = [
    { num: '01', title: 'Register Account', desc: 'Create your free account within 60 seconds with instant security verification.' },
    { num: '02', title: 'Add Funds', desc: 'Deposit funds seamlessly using Bitcoin, USDT, Ethereum, or electronic payment gateways.' },
    { num: '03', title: 'Select a Plan', desc: 'Choose from our high-performing investment packages tailored to your yield target.' },
    { num: '04', title: 'Highly Profitable', desc: 'Receive automated daily yield returns directly to your withdrawable wallet balance.' },
  ];

  return (
    <div className="bg-[#0B0326] text-white min-h-screen font-sans selection:bg-[#FF5A1F] selection:text-white overflow-x-hidden">
      {/* ------------------- 1. NAVIGATION BAR ------------------- */}
      <header className="sticky top-0 z-50 bg-[#0B0326]/95 backdrop-blur-md border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-none">
                GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#A397C7] tracking-widest uppercase font-semibold">
                Investment Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a href="#home" className="text-[#FF5A1F] transition-colors">Home</a>
            <a href="#about" className="text-slate-300 hover:text-[#FF5A1F] transition-colors">About Us</a>
            <Link to="/login" className="text-slate-300 hover:text-[#FF5A1F] transition-colors">Plan</Link>
          </nav>

          {/* Right Actions (Login / Go to Dashboard Button & Mobile Hamburger Toggle) */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-amber-600 hover:opacity-90 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#FF5A1F]/30 transition-all active:scale-95 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#FF5A1F]/30 transition-all active:scale-95 inline-block"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-200 hover:text-white transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ------------------- MOBILE NAVIGATION DRAWER (< 768px) ------------------- */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-20 bg-[#0B0326]/98 backdrop-blur-xl border-b border-purple-800/40 p-6 space-y-4 shadow-2xl animate-fadeIn z-40">
            <nav className="flex flex-col space-y-3 font-bold text-base">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl bg-purple-950/60 text-[#FF5A1F] border border-purple-800/30 flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl bg-purple-950/30 text-purple-200 hover:text-white border border-purple-900/30 flex items-center justify-between"
              >
                <span>About Us</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl bg-purple-950/30 text-purple-200 hover:text-white border border-purple-900/30 flex items-center justify-between"
              >
                <span>Investment Plans</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>

            <div className="pt-2 border-t border-purple-900/40">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-xl bg-[#FF5A1F] text-white font-black text-center text-sm shadow-lg shadow-[#FF5A1F]/30 block min-h-[48px] flex items-center justify-center"
              >
                Access Member Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ------------------- 2. HERO SECTION ------------------- */}
      <section id="home" className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20">
                <Zap className="w-3.5 h-3.5" />
                <span>INSTITUTIONAL ASSET MANAGEMENT</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black uppercase text-white leading-[1.1] tracking-tight">
                BEST INVESTMENTS PLAN FOR <span className="text-[#FF5A1F]">WORLDWIDE</span>
              </h1>

              <p className="text-[#A397C7] text-base sm:text-lg leading-relaxed max-w-xl">
                Empowering global investors with state-of-the-art crypto asset management, high yield structural growth plans, and institutional-grade cold storage security.
              </p>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-base shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Join Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Graphic: Holographic Bitcoin & Earth Graphic */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-purple-950 via-[#15083D] to-[#0B0326] p-1 border border-purple-800/40 shadow-2xl flex items-center justify-center group">
                {/* Glowing Pulsing Ring */}
                <div className="absolute inset-0 rounded-full border border-[#FF5A1F]/30 animate-ping opacity-25" />
                
                {/* Orbital Tech Ring */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-purple-500/20 animate-spin-slow" />

                {/* Digital Earth Grid SVG & Bitcoin Emblem */}
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#180A47] to-[#0A0222]">
                  {/* Cyber Lines SVG */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="160" stroke="#FF5A1F" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="200" cy="200" r="120" stroke="#8B5CF6" strokeWidth="1" />
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#FF5A1F" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="400" stroke="#8B5CF6" strokeWidth="1" />
                  </svg>

                  {/* Golden Bitcoin 3D Emblem */}
                  <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1.5 shadow-2xl shadow-amber-500/40 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-200/50 shadow-inner">
                      <span className="text-6xl sm:text-7xl font-black text-amber-950 tracking-tighter drop-shadow-md">
                        ₿
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 3. COUNTER / STATISTICS RIBBON ------------------- */}
      <section className="py-8 bg-black/40 border-y border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-2xl p-6 flex items-center space-x-5 shadow-xl hover:border-[#FF5A1F]/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">25000</p>
                <p className="text-xs font-semibold text-[#A397C7] uppercase tracking-wider">Total Members</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-2xl p-6 flex items-center space-x-5 shadow-xl hover:border-[#FF5A1F]/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">12.5M</p>
                <p className="text-xs font-semibold text-[#A397C7] uppercase tracking-wider">Total Deposits Amount</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-2xl p-6 flex items-center space-x-5 shadow-xl hover:border-[#FF5A1F]/40 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">200</p>
                <p className="text-xs font-semibold text-[#A397C7] uppercase tracking-wider">Total Withdrawals Amount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 4. ABOUT US SECTION ------------------- */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">ABOUT US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Welcome To Global Profit Hub</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Image Box */}
            <div className="relative rounded-3xl overflow-hidden border border-purple-900/40 bg-gradient-to-b from-[#180A47] to-[#0B0326] p-2 shadow-2xl">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-950 via-purple-900 to-[#100436] flex items-center justify-center">
                {/* SVG Digital Network Artwork */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#FF5A1F_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 text-center p-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#FF5A1F]/20 border-2 border-[#FF5A1F] flex items-center justify-center text-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/40 animate-pulse">
                    <Globe className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Institutional Crypto Network</h3>
                  <p className="text-xs text-[#A397C7] max-w-sm mx-auto">
                    Automated arbitrage and structural yield algorithms processing real-time crypto transactions worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Text Content */}
            <div className="space-y-6">
              <p className="text-[#A397C7] leading-relaxed text-sm sm:text-base">
                Global Profit Hub is a premier digital asset investment firm engineered to deliver sustainable, high-yield financial growth. Utilizing advanced algorithmic trading models and decentralized liquidity pools, we minimize market exposure while guaranteeing fixed structured returns.
              </p>
              <p className="text-[#A397C7] leading-relaxed text-sm sm:text-base">
                Our global infrastructure operates 24/7 with zero downtime. From algorithmic arbitrage to high-efficiency ASIC mining hardware, every asset plan is backed by physical reserves and institutional cold storage protocols.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => alert('Global Profit Hub offers 10 structural investment packages with instant automated withdrawals.')}
                  className="px-8 py-3.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-sm shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 5. INVESTMENT PLANS SECTION ------------------- */}
      <section className="py-20 bg-black/30 border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">INVESTMENT PLAN</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Investment Plans</h2>
            <p className="text-sm text-[#A397C7] max-w-lg mx-auto">
              Invest in our structural asset plans to maximize daily yields safely.
            </p>
          </div>

          {/* Dynamic Plans Mapping from GET /api/plans */}
          {loadingPlans ? (
            <div className="py-16 text-center text-[#A397C7] space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A1F] mx-auto" />
              <p className="text-sm font-semibold">Loading available investment packages...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto bg-[#130833] border border-purple-900/40 rounded-3xl p-8 shadow-2xl">
              <Award className="w-12 h-12 text-purple-400 mx-auto" />
              <p className="text-sm font-semibold text-[#A397C7]">
                No investment packages currently available. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.map((plan, index) => (
                <div
                  key={plan._id || index}
                  className="relative bg-gradient-to-b from-[#140838] to-[#0D042B] border border-purple-900/40 rounded-3xl p-8 text-center shadow-xl hover:border-[#FF5A1F]/50 transition-all duration-300 hover:-translate-y-1 group overflow-hidden flex flex-col justify-between"
                >
                  {/* Diagonal Badge Ribbon */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#FF5A1F] text-white text-[10px] font-black uppercase px-8 py-1 rotate-45 translate-x-6 translate-y-3 shadow-md">
                      {plan.badgeTag || `${plan.dailyReturnPercentage || 5}%`}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-bold text-white">
                      {plan.name} {plan.tokenSymbol ? `(${plan.tokenSymbol})` : ''}
                    </h3>
                    <div className="py-2">
                      <span className="text-4xl font-black text-[#FF5A1F]">${plan.price}</span>
                      <span className="text-xs text-[#A397C7] ml-1">USD</span>
                    </div>

                    <div className="w-full h-px bg-purple-900/40" />

                    <ul className="space-y-3 text-xs text-[#A397C7] text-left mx-auto max-w-[200px]">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                        <span>
                          Daily Return: <strong className="text-slate-200">{plan.dailyReturnPercentage || 5}%</strong>
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                        <span>
                          Frequency: <strong className="text-slate-200">{plan.frequency || 'Every 24 Hours'}</strong>
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                        <span>
                          Capital Back: <strong className="text-emerald-400 font-bold">{plan.capitalBack !== false ? 'Yes' : 'No'}</strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Link
                      to="/login"
                      state={{ selectedPlan: plan, planId: plan._id, planPrice: plan.price }}
                      className="w-full py-3 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-sm block shadow-lg shadow-[#FF5A1F]/20 transition-all group-hover:scale-[1.02]"
                    >
                      Invest Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------- 6. FEATURES SECTION ------------------- */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">WHY CHOOSE US</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Why Choose Investment Plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="bg-[#130833]/70 border border-purple-900/40 rounded-2xl p-6 flex items-start space-x-5 shadow-lg hover:border-[#FF5A1F]/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-[#FF5A1F] shrink-0">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#FF5A1F]">{item.title}</h3>
                    <p className="text-xs text-[#A397C7] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------- 7. HOW IT WORKS WORKFLOW SECTION ------------------- */}
      <section className="py-20 bg-black/40 border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Video Thumbnail Presentation Box */}
            <div className="relative rounded-3xl overflow-hidden border border-purple-900/50 bg-gradient-to-br from-[#180A47] to-[#0A0222] p-2 shadow-2xl">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {/* Graphic illustration background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-[#140838] to-indigo-950 opacity-90" />
                
                {/* Central Orange Play Video Button */}
                <button
                  onClick={() => setVideoOpen(true)}
                  className="relative z-10 w-20 h-20 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-2xl shadow-[#FF5A1F]/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                >
                  <Play className="w-8 h-8 fill-white ml-1 group-hover:scale-105" />
                  <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 bg-[#0B0326]/80 backdrop-blur-md p-3 rounded-xl border border-purple-800/40 text-center text-xs text-[#A397C7]">
                  Watch how Global Profit Hub automates crypto yield investments
                </div>
              </div>
            </div>

            {/* Right Workflow Steps */}
            <div className="space-y-8">
              <div>
                <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">WORKFLOW</span>
                <h2 className="text-3xl font-extrabold text-white mt-1">How it works</h2>
              </div>

              <div className="space-y-6">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] font-black text-sm flex items-center justify-center shrink-0">
                      {step.num}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">{step.title}</h3>
                      <p className="text-xs text-[#A397C7] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 8. CLIENT TESTIMONIALS SECTION ------------------- */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Check Our Client Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-3xl p-8 relative shadow-xl space-y-6">
              <Quote className="w-10 h-10 text-[#FF5A1F] absolute top-6 right-6 opacity-40" />
              <p className="text-xs sm:text-sm text-[#A397C7] leading-relaxed pr-8">
                "Global Profit Hub has completely transformed my portfolio strategy. Their daily yield payouts are automated and dependable. Highly recommended for crypto investors seeking stability!"
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-500 text-white font-bold flex items-center justify-center text-sm border-2 border-purple-700">
                  DH
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">David Henry</h4>
                  <p className="text-[11px] text-[#A397C7]">Senior Investor</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-3xl p-8 relative shadow-xl space-y-6">
              <Quote className="w-10 h-10 text-[#FF5A1F] absolute top-6 right-6 opacity-40" />
              <p className="text-xs sm:text-sm text-[#A397C7] leading-relaxed pr-8">
                "The level of security and transparent reporting is unmatched. I started with the Silver plan and scaled up to Bitmain S19 Pro. The instant withdrawal speed is incredible."
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm border-2 border-purple-700">
                  MD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mark Daniel</h4>
                  <p className="text-[11px] text-[#A397C7]">Crypto Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 9. LATEST BLOG / NEWS GRID ------------------- */}
      <section className="py-20 bg-black/40 border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-black tracking-widest text-[#FF5A1F] uppercase">OUR BLOGS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Latest News Updates From Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blog 1 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl space-y-4 hover:border-[#FF5A1F]/40 transition-all group">
              <div className="h-44 bg-gradient-to-br from-indigo-950 via-purple-900 to-[#100436] p-4 flex items-center justify-center relative overflow-hidden">
                <span className="text-5xl">₿</span>
              </div>
              <div className="p-6 space-y-3">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#FF5A1F]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>20 JUL 2026</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-2">
                  Next Generation Crypto Asset Strategies for 2026
                </h3>
                <p className="text-xs text-[#A397C7] leading-relaxed line-clamp-3">
                  Discover how institutional algorithms and AI trading models are maximizing yield returns in volatile market cycles.
                </p>
              </div>
            </div>

            {/* Blog 2 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl space-y-4 hover:border-[#FF5A1F]/40 transition-all group">
              <div className="h-44 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-4 flex items-center justify-center relative overflow-hidden">
                <span className="text-5xl">Ξ</span>
              </div>
              <div className="p-6 space-y-3">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#FF5A1F]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>18 JUL 2026</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-2">
                  Why Multi-Sig Cold Wallets Are Essential for Investor Security
                </h3>
                <p className="text-xs text-[#A397C7] leading-relaxed line-clamp-3">
                  Understanding the multi-tier cryptographic security architecture protecting member funds at Global Profit Hub.
                </p>
              </div>
            </div>

            {/* Blog 3 */}
            <div className="bg-[#130833]/80 border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl space-y-4 hover:border-[#FF5A1F]/40 transition-all group">
              <div className="h-44 bg-gradient-to-br from-[#180A47] via-indigo-950 to-purple-950 p-4 flex items-center justify-center relative overflow-hidden">
                <span className="text-5xl">⚡</span>
              </div>
              <div className="p-6 space-y-3">
                <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#FF5A1F]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>15 JUL 2026</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-2">
                  Exploring High-Yield Staking & Structural Mining Pools
                </h3>
                <p className="text-xs text-[#A397C7] leading-relaxed line-clamp-3">
                  An in-depth breakdown of how our structural mining plans generate consistent daily yield returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- 10. PARTNER LOGOS & FOOTER SECTION ------------------- */}
      {/* Partner Ribbon */}
      <section className="py-8 bg-black/60 border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
            {['Perfect Money', 'Payeer', 'Tether USDT', 'Bitcoin', 'Ethereum', 'Binance Pay'].map((partner, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main 4-Column Footer */}
      <footer className="bg-[#07021A] border-t border-purple-900/40 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] flex items-center justify-center text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white">
                  GLOBAL <span className="text-[#FF5A1F]">PROFIT</span> HUB
                </span>
              </div>
              <p className="text-xs text-[#A397C7] leading-relaxed">
                Global Profit Hub is a world-class crypto investment platform dedicated to delivering consistent structural yields and maximum asset protection.
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs text-[#A397C7]">
                <li><a href="#home" className="hover:text-[#FF5A1F] transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-[#FF5A1F] transition-colors">About Us</a></li>
                <li><Link to="/login" className="hover:text-[#FF5A1F] transition-colors">Plan</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-2.5 text-xs text-[#A397C7]">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <span>71 Wall Street, Financial District, NY 10005</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>support@globalprofithub.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                  <span>+1 (800) 555-0199</span>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Follow Us On</h4>
              <div className="flex items-center space-x-3 pt-1">
                {['TW', 'TG', 'LN', 'DC'].map((social, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-purple-900/30 pt-6 text-center">
            <p className="text-xs text-[#A397C7]">
              Copyright © All Rights Reserved by Global Profit Hub
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#130833] border border-purple-800/60 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Global Profit Hub Presentation</h3>
            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center border border-purple-900/60">
              <div className="text-center space-y-3">
                <Play className="w-12 h-12 text-[#FF5A1F] mx-auto animate-pulse" />
                <p className="text-xs text-[#A397C7]">Streaming presentation video...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
