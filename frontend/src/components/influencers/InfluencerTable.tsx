import React, { useState } from 'react';
import { 
  RefreshCw, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ArrowUpDown,
  Play,
  Pause,
  Zap,
  CheckSquare
} from 'lucide-react';
import type { Influencer } from '../../types';
import { AvatarImage } from '../common/AvatarImage';

interface InfluencerTableProps {
  influencers: Influencer[];
  onFetchNow: (id: number) => void;
  onEdit: (influencer: Influencer) => void;
  onDelete: (id: number) => void;
  onSelectInfluencer?: (id: number) => void;
  onToggleStatus?: (influencer: Influencer) => void;
  onBulkAction?: (action: 'start' | 'stop' | 'fetch' | 'delete', ids: number[]) => void;
}

export const InfluencerTable: React.FC<InfluencerTableProps> = ({
  influencers,
  onFetchNow,
  onEdit,
  onDelete,
  onSelectInfluencer,
  onToggleStatus,
  onBulkAction,
}) => {
  const [sortField, setSortField] = useState<keyof Influencer>('follower_count');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [fetchingIds, setFetchingIds] = useState<Record<number, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSort = (field: keyof Influencer) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedData = [...influencers].sort((a, b) => {
    let valA = a[sortField] ?? '';
    let valB = b[sortField] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(influencers.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e: React.MouseEvent | React.ChangeEvent, id: number) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSingleFetch = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFetchingIds(prev => ({ ...prev, [id]: true }));
    await onFetchNow(id);
    setFetchingIds(prev => ({ ...prev, [id]: false }));
  };

  const handleToggleStatusClick = (e: React.MouseEvent, inf: Influencer) => {
    e.stopPropagation();
    if (onToggleStatus) onToggleStatus(inf);
  };

  const handleEditClick = (e: React.MouseEvent, inf: Influencer) => {
    e.stopPropagation();
    onEdit(inf);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onDelete(id);
  };

  const executeBulk = (action: 'start' | 'stop' | 'fetch' | 'delete') => {
    if (onBulkAction && selectedIds.length > 0) {
      onBulkAction(action, selectedIds);
      if (action === 'delete') {
        setSelectedIds([]);
      }
    }
  };

  return (
    <div className="saas-card p-0 overflow-hidden space-y-0">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#1c2128] border-b border-[#30363d] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <CheckSquare className="w-4 h-4 text-[#58a6ff]" />
            <span>{selectedIds.length} profile(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => executeBulk('start')}
              className="saas-button-secondary text-xs py-1 border-emerald-800 text-emerald-400 hover:bg-emerald-950/40"
            >
              <Play className="w-3 h-3 fill-emerald-400" /> Start Service ({selectedIds.length})
            </button>
            <button
              onClick={() => executeBulk('stop')}
              className="saas-button-secondary text-xs py-1 border-rose-800 text-rose-400 hover:bg-rose-950/40"
            >
              <Pause className="w-3 h-3 fill-rose-400" /> Stop Service ({selectedIds.length})
            </button>
            <button
              onClick={() => executeBulk('fetch')}
              className="saas-button-secondary text-xs py-1 border-indigo-800 text-indigo-300 hover:bg-indigo-950/40"
            >
              <Zap className="w-3 h-3 text-amber-300" /> Fetch Now ({selectedIds.length})
            </button>
            <button
              onClick={() => executeBulk('delete')}
              className="saas-button-secondary text-xs py-1 border-red-900 text-red-400 hover:bg-red-950/40"
            >
              <Trash2 className="w-3 h-3" /> Delete ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="saas-table">
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === influencers.length && influencers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded bg-[#0d1117] border-[#30363d] cursor-pointer"
                />
              </th>
              <th>Influencer</th>
              <th className="cursor-pointer" onClick={() => handleSort('follower_count')}>
                <div className="flex items-center gap-1">
                  Followers <ArrowUpDown className="w-3 h-3 text-[#8b949e]" />
                </div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('today_change')}>
                <div className="flex items-center gap-1">
                  Today's Delta <ArrowUpDown className="w-3 h-3 text-[#8b949e]" />
                </div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('weekly_change')}>
                <div className="flex items-center gap-1">
                  7-Day Change <ArrowUpDown className="w-3 h-3 text-[#8b949e]" />
                </div>
              </th>
              <th>Category</th>
              <th>Service Status</th>
              <th>Last Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#8b949e]">
                  No influencers found matching your current filter criteria.
                </td>
              </tr>
            ) : (
              sortedData.map((inf) => (
                <tr
                  key={inf.id}
                  onClick={() => onSelectInfluencer && onSelectInfluencer(inf.id)}
                  className={`hover:bg-[#1c2128] cursor-pointer transition-colors ${selectedIds.includes(inf.id) ? 'bg-[#1c2128]/80' : ''}`}
                >
                  <td className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inf.id)}
                      onChange={(e) => handleSelectRow(e, inf.id)}
                      className="rounded bg-[#0d1117] border-[#30363d] cursor-pointer"
                    />
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <AvatarImage
                          src={inf.avatar_url}
                          username={inf.username}
                          className="w-9 h-9 rounded-full border border-[#30363d] bg-[#0d1117] object-cover"
                        />
                        {/* Status Indicator Dot on Avatar */}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161b22] ${
                            inf.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          }`}
                          title={inf.status === 'active' ? 'Service ON (Active Fetching)' : 'Service OFF (Paused)'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-white flex items-center gap-1.5 hover:text-[#58a6ff]">
                          {inf.display_name}
                          <a
                            href={inf.profile_url || `https://instagram.com/${inf.username}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#8b949e] hover:text-[#58a6ff]"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[11px] text-[#8b949e]">@{inf.username}</div>
                        {inf.bio && (
                          <div className="text-[10px] text-[#8b949e]/80 truncate max-w-xs mt-0.5" title={inf.bio}>
                            {inf.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="font-bold text-white">
                    {inf.follower_count.toLocaleString()}
                  </td>

                  <td>
                    <span className={`font-semibold ${inf.today_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inf.today_change > 0 ? `+${inf.today_change.toLocaleString()}` : inf.today_change.toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className={`font-semibold ${inf.weekly_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inf.weekly_change > 0 ? `+${inf.weekly_change.toLocaleString()}` : inf.weekly_change.toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                      {inf.category || 'General'}
                    </span>
                  </td>

                  {/* Status Indicator Bar with Green 🟢 and Red 🔴 dots */}
                  <td>
                    {inf.status === 'active' ? (
                      <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400">Service ON</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-xs font-semibold text-rose-400">Service OFF</span>
                      </div>
                    )}
                  </td>

                  <td className="text-xs text-[#8b949e]">
                    {inf.last_updated ? new Date(inf.last_updated).toLocaleString() : 'Never'}
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Individual Start / Stop Service Toggle Button */}
                      <button
                        onClick={(e) => handleToggleStatusClick(e, inf)}
                        title={inf.status === 'active' ? 'Stop Service (Pause Fetching)' : 'Start Service (Enable Fetching)'}
                        className={`p-1.5 rounded cursor-pointer ${
                          inf.status === 'active'
                            ? 'hover:bg-rose-950/50 text-rose-400 border border-rose-900/50'
                            : 'hover:bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'
                        }`}
                      >
                        {inf.status === 'active' ? (
                          <Pause className="w-3.5 h-3.5 fill-rose-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={(e) => handleSingleFetch(e, inf.id)}
                        disabled={fetchingIds[inf.id]}
                        title="Live Fetch Stats Now"
                        className="p-1.5 rounded hover:bg-[#30363d] text-[#58a6ff] disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${fetchingIds[inf.id] ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleEditClick(e, inf)}
                        title="Edit Influencer"
                        className="p-1.5 rounded hover:bg-[#30363d] text-[#c9d1d9] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteClick(e, inf.id)}
                        title="Delete Influencer"
                        className="p-1.5 rounded hover:bg-[#30363d] text-[#f85149] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
