import React, { useState, useEffect } from 'react';
import type { LogEntry } from '../types';
import { LogsService } from '../services/api';
import { FileText, RefreshCw, Trash2, Filter } from 'lucide-react';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await LogsService.getLogs(100, levelFilter);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, 5000);
    return () => clearInterval(timer);
  }, [levelFilter]);

  const handleClear = async () => {
    await LogsService.clearLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Live System & Scraper Logs</h3>
            <p className="text-xs text-[#8b949e]">Real-time output stream from Loguru backend service.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-[#8b949e]" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-transparent text-xs text-white outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO Only</option>
              <option value="WARNING">WARNING Only</option>
              <option value="ERROR">ERROR Only</option>
            </select>
          </div>

          <button onClick={fetchLogs} className="saas-button-secondary text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button onClick={handleClear} className="saas-button-secondary text-xs text-[#f85149]">
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Logs Window */}
      <div className="saas-card bg-[#090d13] p-4 font-mono text-xs overflow-x-auto h-[550px] border-[#30363d]">
        {logs.length === 0 ? (
          <div className="text-[#8b949e] py-12 text-center">No logs generated yet.</div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 py-1 border-b border-[#161b22] hover:bg-[#161b22] px-2 rounded">
                <span className="text-[#8b949e] select-none text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.level === 'ERROR'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : log.level === 'WARNING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-purple-400 font-semibold text-[11px]">{log.module}</span>
                <span className="text-[#c9d1d9]">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
