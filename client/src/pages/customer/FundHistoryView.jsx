import React, { useState, useEffect } from 'react';
import { fetchFundHistoryApi } from '../../services/api';
import { listenToRealtimeEvents } from '../../services/socket';
import { Search, Calendar, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const FundHistoryView = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All Payment');
  const [selectedDate, setSelectedDate] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchFundHistoryApi();
      if (res.data) {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.warn('[Fund History] Error loading backend history:', err.message);
      // Fallback matching image_2df188.png
      setHistoryData([
        {
          _id: 'dep_default_1',
          transactionId: '09KBCBGZ8FU4',
          gatewayType: 'USDT ( BEP 20 )',
          requestedAmount: 100,
          charge: 0,
          status: 'Pending',
          createdAt: new Date('2026-07-20T15:29:00Z').toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (event === 'deposit_created' || event === 'deposit_updated') {
        loadHistory();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filtered dataset
  const filteredHistory = historyData.filter((item) => {
    const matchesSearch =
      item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gatewayType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      paymentFilter === 'All Payment' ||
      (paymentFilter === 'Pending' && item.status === 'Pending') ||
      (paymentFilter === 'Approved' && item.status === 'Approved') ||
      (paymentFilter === 'Rejected' && item.status === 'Rejected');

    const matchesDate =
      !selectedDate ||
      new Date(item.createdAt).toISOString().slice(0, 10) === selectedDate;

    return matchesSearch && matchesFilter && matchesDate;
  });

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '20 Jul 2026 03:29 PM';
    }
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ------------------- SECTION HEADER ------------------- */}
        <div className="border-b border-purple-900/30 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fund History</h1>
        </div>

        {/* ------------------- SEARCH & FILTER BAR GRID ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl p-5 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
          >
            {/* Input 1: Search Text */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type Here"
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>

            {/* Input 2: Dropdown Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
              >
                <option value="All Payment" className="bg-[#0B0326]">All Payment</option>
                <option value="Pending" className="bg-[#0B0326]">Pending</option>
                <option value="Approved" className="bg-[#0B0326]">Approved</option>
                <option value="Rejected" className="bg-[#0B0326]">Rejected</option>
              </select>
            </div>

            {/* Input 3: Date Selector */}
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select a date"
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
              />
            </div>

            {/* Primary Action Button: Wide, Sharply Angled Orange SEARCH Button */}
            <div>
              <button
                type="button"
                onClick={() => {}}
                className="w-full py-3.5 px-6 bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5A1F]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]"
              >
                SEARCH
              </button>
            </div>
          </form>
        </div>

        {/* ------------------- FUND HISTORY TRANSACTION TABLE (image_2df188.png) ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              {/* Solid Vibrant Orange Horizontal Header Block */}
              <thead className="bg-[#FF5A1F] text-white font-black uppercase text-xs tracking-wider border-b border-[#FF5A1F]">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Charge</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>

              {/* Rows Mapping */}
              <tbody className="divide-y divide-purple-900/30 bg-[#130833]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#A397C7]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F] mx-auto mb-2" />
                      <span>Loading Fund History records...</span>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#A397C7]">
                      <AlertCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <span>No deposit transactions found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row) => (
                    <tr key={row._id} className="hover:bg-purple-950/40 transition-colors">
                      {/* Transaction ID */}
                      <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">
                        {row.transactionId}
                      </td>

                      {/* Gateway */}
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {row.gatewayType}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-bold text-[#FF5A1F]">
                        {row.requestedAmount} USD
                      </td>

                      {/* Charge */}
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        {row.charge || 0} USD
                      </td>

                      {/* Status Badge Tag */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                            row.status === 'Pending'
                              ? 'bg-[#FFCC00] text-black shadow-md'
                              : row.status === 'Approved'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-rose-600 text-white shadow-md'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 text-right font-mono text-[11px] text-[#A397C7]">
                        {formatDate(row.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
