import React, { useState, useEffect } from 'react';
import type { Influencer, HistoryRecord } from '../types';
import { InfluencerService, HistoryService } from '../services/api';
import { AvatarImage } from '../components/common/AvatarImage';
import { 
  ArrowLeft, 
  Zap, 
  Edit3, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InfluencerDetailPageProps {
  influencerId: number;
  onBack: () => void;
  onEdit: (influencer: Influencer) => void;
}

export const InfluencerDetailPage: React.FC<InfluencerDetailPageProps> = ({
  influencerId,
  onBack,
  onEdit,
}) => {
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [togglingService, setTogglingService] = useState(false);

  const loadData = async () => {
    try {
      const [infData, histData] = await Promise.all([
        InfluencerService.getInfluencer(influencerId),
        HistoryService.getHistory(influencerId, 100)
      ]);
      setInfluencer(infData);
      setHistory(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [influencerId]);

  const handleLiveFetch = async () => {
    setFetchingLive(true);
    try {
      await InfluencerService.triggerFetch(influencerId);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingLive(false);
    }
  };

  const handleToggleService = async () => {
    if (!influencer) return;
    setTogglingService(true);
    const nextStatus = influencer.status === 'active' ? 'paused' : 'active';
    try {
      await InfluencerService.updateInfluencer(influencer.id, { status: nextStatus });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingService(false);
    }
  };

  if (loading || !influencer) {
    return (
      <div className="p-12 text-center text-xs text-[#8b949e] flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        Loading profile statistics & fetch history...
      </div>
    );
  }

  // Format Recharts data chronologically (oldest to newest)
  const chartData = [...history].reverse().map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    followers: h.follower_count,
    delta: h.follower_delta
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="saas-button-secondary text-xs cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Influencers
        </button>

        <div className="flex items-center gap-2">
          {/* Start / Stop Service Toggle Button */}
          <button
            onClick={handleToggleService}
            disabled={togglingService}
            className={`saas-button-secondary text-xs cursor-pointer ${
              influencer.status === 'active'
                ? 'border-rose-800 text-rose-400 hover:bg-rose-950/40'
                : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            {influencer.status === 'active' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-rose-400" /> Stop Service
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-emerald-400" /> Start Service
              </>
            )}
          </button>

          <button
            onClick={() => onEdit(influencer)}
            className="saas-button-secondary text-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile Details
          </button>

          <button
            onClick={handleLiveFetch}
            disabled={fetchingLive}
            className="saas-button-primary text-xs cursor-pointer text-white"
          >
            {fetchingLive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            {fetchingLive ? 'Fetching Live Data...' : 'Live Fetch Now'}
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="saas-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AvatarImage
              src={influencer.avatar_url}
              username={influencer.username}
              className="w-16 h-16 rounded-full border-2 border-[#30363d] bg-[#0d1117] object-cover"
            />
            {/* Status Indicator Dot */}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#161b22] ${
                influencer.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{influencer.display_name}</h1>
              <a
                href={influencer.profile_url || `https://instagram.com/${influencer.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#8b949e] hover:text-[#58a6ff]"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="text-xs text-[#8b949e] flex items-center gap-3 mt-1">
              <span>@{influencer.username}</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                {influencer.category || 'General'}
              </span>

              {/* Green 🟢 / Red 🔴 Status Badge */}
              {influencer.status === 'active' ? (
                <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">Service ON</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-xs font-semibold text-rose-400">Service OFF</span>
                </div>
              )}
            </div>

            {influencer.bio && (
              <p className="text-xs text-[#c9d1d9] mt-2 max-w-2xl leading-relaxed">
                {influencer.bio}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-white tracking-tight">
            {influencer.follower_count.toLocaleString()}
          </div>
          <div className="text-xs text-[#8b949e] mt-0.5">Total Followers</div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="saas-card">
          <div className="text-xs text-[#8b949e] font-medium">Today's Delta</div>
          <div className={`text-xl font-bold mt-2 ${influencer.today_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {influencer.today_change > 0 ? `+${influencer.today_change.toLocaleString()}` : influencer.today_change.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8b949e] mt-0.5">Last 24 Hours</div>
        </div>

        <div className="saas-card">
          <div className="text-xs text-[#8b949e] font-medium">7-Day Change</div>
          <div className={`text-xl font-bold mt-2 ${influencer.weekly_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {influencer.weekly_change > 0 ? `+${influencer.weekly_change.toLocaleString()}` : influencer.weekly_change.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8b949e] mt-0.5">Past 7 Days</div>
        </div>

        <div className="saas-card">
          <div className="text-xs text-[#8b949e] font-medium">30-Day Change</div>
          <div className={`text-xl font-bold mt-2 ${influencer.monthly_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {influencer.monthly_change > 0 ? `+${influencer.monthly_change.toLocaleString()}` : influencer.monthly_change.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8b949e] mt-0.5">Past 30 Days</div>
        </div>

        <div className="saas-card">
          <div className="text-xs text-[#8b949e] font-medium">Last Updated</div>
          <div className="text-sm font-semibold text-white mt-2">
            {influencer.last_updated ? new Date(influencer.last_updated).toLocaleTimeString() : 'Never'}
          </div>
          <div className="text-[11px] text-[#8b949e] mt-0.5">
            {influencer.last_updated ? new Date(influencer.last_updated).toLocaleDateString() : 'No fetches'}
          </div>
        </div>
      </div>

      {/* Per-Profile Follower Growth Graph */}
      <div className="saas-card h-80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Follower Growth Progression</h3>
            <p className="text-xs text-[#8b949e]">Historical timeline graph of follower count snapshots</p>
          </div>
        </div>

        <div className="w-full h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#238636" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#238636" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" stroke="#8b949e" fontSize={11} tickLine={false} />
              <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '0.375rem', fontSize: '12px' }}
                labelStyle={{ color: '#f0f6fc', fontWeight: 'bold' }}
                formatter={(val: any) => [Number(val || 0).toLocaleString() + ' followers', 'Followers']}
              />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#3fb950"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profileGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Granular Per-Fetch Follower Delta History Table */}
      <div className="saas-card p-0 overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Per-Fetch Follower Delta Log</h3>
            <p className="text-xs text-[#8b949e]">Exact follower count changes recorded on every fetch interval tick.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Followers Snapshot</th>
                <th>Follower Delta (Change)</th>
                <th>Response Time</th>
                <th>Fetch Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#8b949e]">
                    No fetch history records available for this profile.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-[#1c2128]">
                    <td className="text-xs text-white">
                      {new Date(h.timestamp).toLocaleString()}
                    </td>

                    <td className="font-bold text-white">
                      {h.follower_count.toLocaleString()}
                    </td>

                    <td>
                      <span className={`font-bold ${h.follower_delta > 0 ? 'text-emerald-400' : h.follower_delta < 0 ? 'text-rose-400' : 'text-[#8b949e]'}`}>
                        {h.follower_delta > 0 ? `+${h.follower_delta.toLocaleString()}` : h.follower_delta.toLocaleString()}
                      </span>
                    </td>

                    <td className="text-xs text-[#8b949e]">
                      {h.duration_ms} ms
                    </td>

                    <td>
                      {h.status === 'success' ? (
                        <span className="badge-active flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span className="badge-error flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> {h.error_message || 'Failed'}
                        </span>
                      )}
                    </td>
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
