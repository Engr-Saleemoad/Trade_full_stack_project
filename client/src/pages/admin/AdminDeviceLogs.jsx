import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/adminAxios';
import {
  Laptop,
  Globe,
  Search,
  RefreshCw,
  Clock,
  ShieldAlert,
  User,
  MapPin,
  Monitor,
} from 'lucide-react';

export const AdminDeviceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDeviceLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/api/admin/device-logs');
      if (res.data && res.data.data) {
        setLogs(res.data.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('[Fetch Device Logs Error]:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const u = (log.username || '').toLowerCase();
    const ip = (log.ipAddress || '').toLowerCase();
    const dev = (log.deviceDetails || log.browser || '').toLowerCase();
    const loc = (log.location || log.city || log.country || '').toLowerCase();
    return u.includes(q) || ip.includes(q) || dev.includes(q) || loc.includes(q);
  });

  return (
    <div className="space-y-6 font-sans">
      {/* ------------------- 1. HEADER SECTION ------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#140838] to-[#0B0326] border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">User Device Details</h1>
            <p className="text-xs text-[#A397C7]">
              Track customer login IP addresses, device user-agents, browsers, locations, and timestamps
            </p>
          </div>
        </div>

        <button
          onClick={fetchDeviceLogs}
          className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 text-purple-200 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5A1F]' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* ------------------- 2. SEARCH CONTROL ------------------- */}
      <div className="bg-[#140838]/60 p-4 rounded-2xl border border-purple-900/40">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search device logs by username, IP address, device, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#07021A] border border-purple-800/40 rounded-xl text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-[#FF5A1F]"
          />
        </div>
      </div>

      {/* ------------------- 3. DATA TABLE ------------------- */}
      <div className="bg-[#140838]/80 border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-purple-300 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span>Loading customer device session logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#A397C7] text-xs space-y-3">
            <Laptop className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="font-semibold text-white">No Login Device Logs Found</p>
            <p className="text-[11px]">Customer login device activities will automatically populate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0326]/80 text-[#A397C7] border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Username</th>
                  <th className="py-4 px-4">IP Address</th>
                  <th className="py-4 px-4">Device Name / Browser</th>
                  <th className="py-4 px-4">Location (City/Country)</th>
                  <th className="py-4 px-4">Login Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-purple-200">
                {filteredLogs.map((log, idx) => {
                  const username = log.username || 'Investor';
                  const ip = log.ipAddress || '127.0.0.1';
                  const device = log.deviceDetails || `${log.browser || 'Browser'} (${log.os || 'OS'})`;
                  const location = log.location || (log.city && log.country ? `${log.city}, ${log.country}` : log.country || 'Global');
                  const timestamp = log.loginTime
                    ? new Date(log.loginTime).toLocaleString()
                    : log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : 'N/A';

                  return (
                    <tr key={log._id || idx} className="hover:bg-purple-900/10 transition-colors">
                      {/* 1. Username */}
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-bold text-[11px]">
                            {username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{username}</p>
                            <p className="text-[10px] text-purple-400">{log.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. IP Address */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-purple-200 bg-[#07021A] px-2.5 py-1 rounded-md border border-purple-800/30 text-[11px]">
                          {ip}
                        </span>
                      </td>

                      {/* 3. Device Name / Browser */}
                      <td className="py-4 px-4 font-semibold text-purple-200">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                          <span>{device}</span>
                        </div>
                      </td>

                      {/* 4. Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5 text-purple-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{location}</span>
                        </div>
                      </td>

                      {/* 5. Login Timestamp */}
                      <td className="py-4 px-4 text-purple-400 text-[11px] font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{timestamp}</span>
                        </div>
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

export default AdminDeviceLogs;
