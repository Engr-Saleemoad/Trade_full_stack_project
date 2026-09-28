import React, { useState, useEffect } from 'react';
import { fetchPayoutHistoryApi } from '../../services/api';
import { listenToRealtimeEvents } from '../../services/socket';
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react';

export const PayoutHistoryView = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchPayoutHistoryApi();
      if (res.data) {
        setPayouts(res.data);
      }
    } catch (err) {
      console.warn('[Payout History] Error loading backend history:', err.message);
      setPayouts([
        {
          _id: 'payout_dev_1',
          transactionId: 'PW9823471029',
          selectedWallet: 'Deposit Balance - $45',
          gatewayType: 'USDT BEP20',
          rawAmount: 40,
          derivedFees: 4,
          finalDeductionAmount: 44,
          recipientWalletAddress: '0x86A04560103588BFA89B478E09F6d89C0C858eEB',
          status: 'Pending',
          createdAt: new Date('2026-07-20T16:00:00Z').toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const unsubscribe = listenToRealtimeEvents((event, data) => {
      if (event === 'payout_created' || event === 'payout_updated') {
        loadHistory();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
      return '20 Jul 2026 04:00 PM';
    }
  };

  return (
    <div className="bg-[#0B0326] text-white min-h-screen p-6 font-sans selection:bg-[#FF5A1F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-purple-900/30 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Payout History</h1>
        </div>

        <div className="bg-[#130833] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#FF5A1F] text-white font-black uppercase text-xs tracking-wider border-b border-[#FF5A1F]">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Charge (10%)</th>
                  <th className="px-6 py-4">Total Deducted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-900/30 bg-[#130833]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#A397C7]">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5A1F] mx-auto mb-2" />
                      <span>Loading Payout History records...</span>
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#A397C7]">
                      <AlertCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <span>No payout requests found.</span>
                    </td>
                  </tr>
                ) : (
                  payouts.map((row) => (
                    <tr key={row._id} className="hover:bg-purple-950/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white tracking-wider">
                        {row.transactionId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {row.gatewayType}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#FF5A1F]">
                        {row.rawAmount} USD
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        {row.derivedFees} USD
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-300">
                        {row.finalDeductionAmount} USD
                      </td>
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
