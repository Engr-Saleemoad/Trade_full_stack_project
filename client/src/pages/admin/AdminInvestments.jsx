import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/adminAxios';
import {
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  User,
  Calendar,
  Percent,
} from 'lucide-react';

export const AdminInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/api/admin/investments');
      if (res.data && res.data.data) {
        setInvestments(res.data.data);
      } else {
        setInvestments([]);
      }
    } catch (err) {
      console.error('[Admin Investments Fetch Error]:', err);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const filteredInvestments = investments.filter((item) => {
    const matchUser = (item.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = (item.planName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = matchUser || matchPlan;

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && (item.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
  });

  const totalInvested = investments.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const activeCount = investments.filter((inv) => (inv.status || 'Active') === 'Active').length;
  const completedCount = investments.filter((inv) => inv.status === 'Completed').length;

  return (
    <div className="space-y-6 font-sans">
      {/* ------------------- 1. HEADER & METRICS GRID ------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Customer Investments</h1>
            <p className="text-xs text-[#A397C7]">
              Monitor all customer active plans, capital investments, and return rates
            </p>
          </div>
        </div>

        <button
          onClick={fetchInvestments}
          className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 text-purple-200 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5A1F]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B0326] border border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium">Total Capital Invested</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">${totalInvested.toFixed(2)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0326] border border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium">Total Investments</span>
            <Award className="w-4 h-4 text-[#FF5A1F]" />
          </div>
          <p className="text-2xl font-black text-white">{investments.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0326] border border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium">Active Plans</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{activeCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0326] border border-purple-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-300 font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-300">{completedCount}</p>
        </div>
      </div>

      {/* ------------------- 2. CONTROLS: SEARCH & FILTER ------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#140838]/60 p-4 rounded-2xl border border-purple-900/40">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer username or plan name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#FF5A1F]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ------------------- 3. DATA TABLE ------------------- */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span>Loading investment records...</span>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="p-12 text-center text-[#A397C7] text-xs space-y-3">
            <TrendingUp className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="font-semibold text-white">No Customer Investments Found</p>
            <p className="text-[11px]">No active or historical investment records match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0326]/80 text-[#A397C7] border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Plan Name</th>
                  <th className="py-4 px-4">Price ($)</th>
                  <th className="py-4 px-4">Daily Return</th>
                  <th className="py-4 px-4">Return Amount</th>
                  <th className="py-4 px-4">Start Date</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-200">
                {filteredInvestments.map((inv) => {
                  const status = inv.status || 'Active';
                  const price = Number(inv.price || inv.investmentAmount || 0);
                  const returnPct = Number(inv.dailyReturnPercentage || inv.profitPercentage || 5);
                  const returnAmt = Number(
                    inv.dailyReturnAmount || inv.returnAmount || (price * returnPct) / 100
                  );
                  const startDate = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={inv._id} className="hover:bg-purple-900/10 transition-colors">
                      {/* Customer */}
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-[11px]">
                            {(inv.username || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{inv.username || 'Customer'}</p>
                            <p className="text-[10px] text-purple-400">{inv.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan Name */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-purple-200">{inv.planName || 'Standard Plan'}</span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-black text-emerald-400">
                        ${price.toFixed(2)}
                      </td>

                      {/* Daily Return % */}
                      <td className="py-4 px-4 font-bold text-purple-300">
                        {returnPct}% / day
                      </td>

                      {/* Daily Return Amount */}
                      <td className="py-4 px-4 font-bold text-emerald-300">
                        +${returnAmt.toFixed(2)}
                      </td>

                      {/* Start Date */}
                      <td className="py-4 px-4 text-purple-400 text-[11px]">
                        {startDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {status === 'Active' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Active</span>
                          </span>
                        )}
                        {status === 'Completed' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {status === 'Cancelled' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvestments;
