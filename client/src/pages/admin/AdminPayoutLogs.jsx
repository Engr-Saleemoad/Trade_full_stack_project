import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';

export const AdminPayoutLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyWallet = (address, id) => {
    if (!address || address === 'N/A') return;
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    showToast('Recipient wallet address copied!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const fetchPayoutLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/payout-logs', getAuthHeaders());
      if (response.data && response.data.data) {
        setLogs(response.data.data);
      } else if (response.data && response.data.payouts) {
        setLogs(response.data.payouts);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('[Admin Payout Logs] Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutLogs();
  }, []);

  const filteredLogs = logs.filter((item) => {
    // Isolate strictly completed logs: status must be Approved or Rejected
    const isCompleted = item.status === 'Approved' || item.status === 'Rejected';
    if (!isCompleted) return false;

    const username = item.user?.username || item.username || '';
    const email = item.user?.email || item.email || '';
    const wallet = item.recipientWalletAddress || item.walletAddress || '';
    const txId = item.transactionId || item._id || '';

    const matchesSearch =
      wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-white bg-[#07021A] min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl border font-semibold text-xs transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-500/20'
                : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B0326] via-[#140838] to-[#0B0326] p-6 rounded-3xl border border-purple-900/40 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5A1F] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/30">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Historical Payout Logs</h1>
          </div>
          <p className="text-xs text-[#A397C7]">Isolated historical archive of completed payouts (Approved & Rejected requests).</p>
        </div>

        <button
          onClick={fetchPayoutLogs}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-200 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0326] p-4 rounded-2xl border border-purple-900/30">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="Search Recipient Wallet Address, Tx ID, or Username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-purple-300 font-medium">
            <Filter className="w-4 h-4 text-[#FF5A1F]" />
            <span>Status Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07021A] border border-purple-800/40 text-xs font-semibold text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
          >
            <option value="All">All Completed</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Payout Logs Table */}
      <div className="bg-[#0B0326] rounded-3xl border border-purple-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A397C7]">
            <thead className="bg-[#140838]/80 text-white uppercase font-bold border-b border-purple-900/40 text-[11px] tracking-wider">
              <tr>
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Transaction ID</th>
                <th className="py-4 px-5">Gateway</th>
                <th className="py-4 px-5">Requested Amount</th>
                <th className="py-4 px-5">Fee Amount</th>
                <th className="py-4 px-5">Final Payout</th>
                <th className="py-4 px-5">Wallet Address</th>
                <th className="py-4 px-5">Final Status</th>
                <th className="py-4 px-5">Log Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-900/20 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-purple-300">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F]" />
                      <p className="text-xs">Loading payout logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-purple-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-purple-500/50" />
                      <p className="text-xs font-semibold">No payout logs found.</p>
                      <p className="text-[11px] text-purple-500">Only completed historical payout logs (Approved/Rejected) appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
                  const isApproved = item.status === 'Approved';
                  const isRejected = item.status === 'Rejected';

                  const username = item.user?.username || item.username || 'Unknown';
                  const email = item.user?.email || item.email || 'N/A';
                  const txId = item.transactionId || (item._id ? item._id.toString() : '-');
                  const gateway = item.gatewayType || item.gateway || 'USDT';

                  const rawAmount = Number(item.rawAmount || item.amount || 0);
                  const fee = item.derivedFees !== undefined ? Number(item.derivedFees) : Number(rawAmount * 0.1);
                  const finalPayout = item.finalDeductionAmount !== undefined ? Number(item.finalDeductionAmount) : Math.max(0, rawAmount - fee);

                  const walletAddress = item.recipientWalletAddress || item.walletAddress || 'N/A';
                  const truncatedWallet =
                    walletAddress !== 'N/A' && walletAddress.length > 14
                      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                      : walletAddress;

                  const formattedDate = item.updatedAt || item.createdAt
                    ? new Date(item.updatedAt || item.createdAt).toLocaleString()
                    : 'N/A';

                  return (
                    <tr key={item._id} className="hover:bg-purple-950/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-[#FF5A1F] text-white font-bold text-xs flex items-center justify-center border border-purple-500/30">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{username}</p>
                            <p className="text-[10px] text-purple-400">{email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-purple-200 bg-[#07021A] px-2.5 py-1 rounded-md border border-purple-800/30 text-[11px]">
                          {txId}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-purple-300 font-semibold">{gateway}</span>
                      </td>

                      <td className="py-4 px-5 font-bold text-white">
                        ${rawAmount.toFixed(2)}
                      </td>

                      <td className="py-4 px-5 text-rose-400 font-semibold">
                        -${fee.toFixed(2)}
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-[#FF5A1F] font-black text-sm drop-shadow-sm">
                          ${finalPayout.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2 bg-[#07021A] px-2.5 py-1.5 rounded-xl border border-purple-800/40 w-fit">
                          <span className="font-mono text-purple-200 font-semibold text-[11px]">
                            {truncatedWallet}
                          </span>
                          {walletAddress !== 'N/A' && (
                            <button
                              onClick={() => handleCopyWallet(walletAddress, item._id)}
                              className="p-1 text-purple-400 hover:text-[#FF5A1F] transition cursor-pointer"
                            >
                              {copiedId === item._id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {isApproved && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-purple-400 text-[11px]">
                        {formattedDate}
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
  );
};

export default AdminPayoutLogs;
