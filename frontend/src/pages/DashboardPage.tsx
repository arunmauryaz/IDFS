import React from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { GrowthChart } from '../components/dashboard/GrowthChart';
import { TopMovers } from '../components/dashboard/TopMovers';
import type { DashboardStats, GrowthAnalytics } from '../types';
import { ArrowRight, Layers } from 'lucide-react';

interface DashboardPageProps {
  stats: DashboardStats | null;
  growth: GrowthAnalytics | null;
  onNavigateToInfluencers: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  growth,
  onNavigateToInfluencers,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Info */}
      <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
        <h2 className="text-sm font-semibold text-white">Instagram Analytics & Growth Dashboard</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Real-time metric monitoring, automated background scraping, and follower delta analytics.
        </p>
      </div>

      {/* Top Metric Cards */}
      <StatsCards stats={stats} />

      {/* Follower Growth Trend Chart */}
      <GrowthChart data={growth ? growth.chart_data : []} />

      {/* Top Growing & Decline Cards */}
      <TopMovers
        topGrowing={growth ? growth.top_growing : []}
        largestDrop={growth ? growth.largest_drop : undefined}
      />

      {/* Recent Activity Table Preview */}
      <div className="saas-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Latest Fetch Activities</h3>
          </div>
          <button
            onClick={onNavigateToInfluencers}
            className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            Manage Profiles <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Followers</th>
                <th>Delta</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {!stats || stats.latest_activity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-[#8b949e]">
                    No recent fetch activities recorded.
                  </td>
                </tr>
              ) : (
                stats.latest_activity.map((act) => (
                  <tr key={act.id}>
                    <td className="font-semibold text-white">@{act.username}</td>
                    <td>{act.follower_count.toLocaleString()}</td>
                    <td>
                      <span className={act.delta >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {act.delta > 0 ? `+${act.delta.toLocaleString()}` : act.delta.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={act.status === 'success' ? 'badge-active' : 'badge-error'}>
                        {act.status}
                      </span>
                    </td>
                    <td className="text-xs text-[#8b949e]">
                      {new Date(act.timestamp).toLocaleString()}
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
