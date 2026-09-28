import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/adminAxios';
import { RefreshCw, AlertCircle, Receipt, Search, Filter } from 'lucide-react';

export const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/api/admin/transactions');
      if (res.data && res.data.data) {
        setTransactions(res.data.data);
      } else if (res.data && res.data.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const username = tx.userId?.username || tx.username || '';
    const email = tx.userId?.email || tx.email || '';
    const txId = tx.uniqueTxId || tx._id || '';
    const remark = tx.remarkDescription || '';
    return (
      username.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      txId.toLowerCase().includes(query) ||
      remark.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Container */}
      <div className="bg-gradient-to-r from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">All Transactions Ledger</h1>
            <p className="text-xs text-[#A397C7]">
              Real-time audit log of all deposit, withdrawal, and ROI transactions platform-wide
            </p>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-purple-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF5A1F]' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl p-4 shadow-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Email, TxID, or Remark..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0326] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F]"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span>Fetching platform transactions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#A397C7] text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-purple-400/40 mx-auto" />
            <p className="font-semibold text-white">No Transaction Logs Found</p>
            <p className="text-[11px]">No transactions match your search filter or collection is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead className="bg-[#0B0326]/90 text-[#A397C7] border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-4">Tx ID</th>
                  <th className="py-4 px-4">User Details</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Remark / Action</th>
                  <th className="py-4 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {filtered.map((tx) => {
                  const isNegative = Number(tx.amount) < 0 || tx.amountString?.includes('-');
                  const userObj = tx.userId;
                  const username = typeof userObj === 'object' ? userObj?.username : tx.username || 'N/A';
                  const email = typeof userObj === 'object' ? userObj?.email : tx.email || '';

                  return (
                    <tr key={tx._id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {tx.uniqueTxId || tx._id.toString().substring(0, 12).toUpperCase()}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-white capitalize">@{username}</p>
                        {email && <p className="text-[11px] text-[#A397C7]">{email}</p>}
                      </td>
                      <td
                        className={`py-4 px-4 font-extrabold text-sm ${
                          isNegative ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {tx.amountString || `${isNegative ? '' : '+'}${tx.amount} USD`}
                      </td>
                      <td className="py-4 px-4 text-purple-200 font-medium">
                        {tx.remarkDescription || tx.type || 'Transaction'}
                      </td>
                      <td className="py-4 px-4 text-[#A397C7] font-mono text-[11px] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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

export default AdminTransactions;
