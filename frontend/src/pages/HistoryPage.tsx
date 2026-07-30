import React, { useState, useEffect } from 'react';
import type { HistoryRecord } from '../types';
import { HistoryService } from '../services/api';
import { RefreshCw, History as HistoryIcon } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await HistoryService.getHistory(undefined, 100);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Full Fetch & Update Audit Trail</h3>
            <p className="text-xs text-[#8b949e]">Detailed timestamp logs of follower count snapshots and HTTP responses.</p>
          </div>
        </div>
        <button onClick={fetchHistory} className="saas-button-secondary text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      <div className="saas-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>History ID</th>
                <th>Influencer ID</th>
                <th>Followers</th>
                <th>Delta</th>
                <th>Duration (ms)</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#8b949e]">
                    {loading ? 'Loading update history...' : 'No history logs found.'}
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="font-mono text-xs text-[#8b949e]">#{h.id}</td>
                    <td className="font-mono text-xs text-[#c9d1d9]">Profile #{h.influencer_id}</td>
                    <td className="font-bold text-white">{h.follower_count.toLocaleString()}</td>
                    <td>
                      <span className={h.follower_delta >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {h.follower_delta > 0 ? `+${h.follower_delta.toLocaleString()}` : h.follower_delta.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-xs text-[#8b949e]">{h.duration_ms} ms</td>
                    <td>
                      <span className={h.status === 'success' ? 'badge-active' : 'badge-error'}>
                        {h.status}
                      </span>
                    </td>
                    <td className="text-xs text-[#8b949e]">{new Date(h.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
