import React, { useState, useEffect } from 'react';
import { fetchMyLedgerApi } from '../../services/api';
import { RefreshCw, AlertCircle, Search, Calendar, Filter } from 'lucide-react';

export const TransactionHistoryView = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTxId, setSearchTxId] = useState('');
  const [remarkFilter, setRemarkFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const loadLedger = async () => {
    setLoading(true);
    try {
      const res = await fetchMyLedgerApi();
      if (res.data) {
        setLedgerData(Array.isArray(res.data) ? res.data : res.transactions || []);
      } else if (res.transactions) {
        setLedgerData(res.transactions);
      } else {
        setLedgerData([]);
      }
    } catch (err) {
      console.warn('[Transaction History] Error loading ledger data:', err.message);
      setLedgerData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  // Filtered dataset
  const filteredLedger = ledgerData.filter((item) => {
    const matchesTxId = !searchTxId || item.uniqueTxId?.toLowerCase().includes(searchTxId.toLowerCase());
    const matchesRemark = !remarkFilter || item.remarkDescription?.toLowerCase().includes(remarkFilter.toLowerCase());
    const matchesDate = !selectedDate || new Date(item.createdAt).toISOString().slice(0, 10) === selectedDate;
    return matchesTxId && matchesRemark && matchesDate;
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
      return '20 Jul 2026 05:35 PM';
    }
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ------------------- SECTION HEADER ------------------- */}
        <div className="border-b border-purple-900/30 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Transaction</h1>
        </div>

        {/* ------------------- ADVANCED SEARCH & FILTER CONFIGURATION BAR ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl p-5 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
          >
            {/* Input 1: Text Box */}
            <div>
              <input
                type="text"
                value={searchTxId}
                onChange={(e) => setSearchTxId(e.target.value)}
                placeholder="Search for Transaction ID"
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors"
              />
            </div>

            {/* Input 2: Select Dropdown */}
            <div>
              <select
                value={remarkFilter}
                onChange={(e) => setRemarkFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
              >
                <option value="" className="bg-[#0B0326]">Remark</option>
                <option value="Withdraw" className="bg-[#0B0326]">Withdrawal Operations</option>
                <option value="Payment" className="bg-[#0B0326]">Approved Payments</option>
                <option value="Invested" className="bg-[#0B0326]">Plan Investments</option>
              </select>
            </div>

            {/* Input 3: Date Picker */}
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select a date"
                className="w-full px-4 py-3 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF5A1F] transition-colors cursor-pointer"
              />
            </div>

            {/* Primary Trigger Button: SEARCH */}
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

        {/* ------------------- COMPLETE TRANSACTION LEDGER DATA TABLE (image_3cf5fe.png) ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              {/* Solid Vibrant Coral/Orange Header Divider */}
              <thead className="bg-[#FF5A1F] text-white font-black uppercase text-xs tracking-wider border-b border-[#FF5A1F]">
                <tr>
                  <th className="px-6 py-4">SL No.</th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>

              {/* Rows Mapping */}
              <tbody className="divide-y divide-purple-900/30 bg-[#130833]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#A397C7]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F] mx-auto mb-2" />
                      <span>Loading Transaction ledger records...</span>
                    </td>
                  </tr>
                ) : filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#A397C7]">
                      <AlertCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <span>No transactions found.</span>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((row, idx) => {
                    const isNegative = Number(row.amount) < 0 || row.amountString?.includes('-');
                    return (
                      <tr key={row._id} className="hover:bg-purple-950/40 transition-colors">
                        {/* SL No. */}
                        <td className="px-6 py-4 font-mono font-extrabold text-white">
                          {idx + 1}
                        </td>

                        {/* Transaction ID */}
                        <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">
                          {row.uniqueTxId}
                        </td>

                        {/* Amount with Color Typography Switching */}
                        <td
                          className={`px-6 py-4 font-extrabold text-sm ${
                            isNegative ? 'text-rose-500' : 'text-emerald-400'
                          }`}
                        >
                          {row.amountString || `${isNegative ? '' : '+'}${row.amount} USD`}
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4 font-semibold text-slate-200">
                          {row.remarkDescription}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 text-right font-mono text-[11px] text-[#A397C7]">
                          {formatDate(row.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
