import React from 'react';
import type { GrowthAnalytics, Influencer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

interface AnalyticsPageProps {
  growth: GrowthAnalytics | null;
  influencers: Influencer[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ growth, influencers }) => {
  const chartData = growth ? growth.top_growing.map(i => ({
    name: i.display_name.length > 12 ? i.display_name.substring(0, 10) + '...' : i.display_name,
    weekly: i.weekly_change,
    today: i.today_change
  })) : [];

  return (
    <div className="space-y-6">
      {/* Overview Analytics Summary */}
      <div className="saas-card bg-gradient-to-r from-[#161b22] to-[#1c2128]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Growth Insights & Executive Summary</h3>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {growth ? growth.summary : 'Analyzing growth patterns across tracked Instagram profiles...'}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart comparison of Top Movers */}
      <div className="saas-card h-80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">7-Day Followers Growth by Profile</h3>
            <p className="text-xs text-[#8b949e]">Top performing profiles comparison</p>
          </div>
        </div>

        <div className="w-full h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" stroke="#8b949e" fontSize={11} tickLine={false} />
              <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '0.375rem', fontSize: '12px' }}
                formatter={(val: any) => [`+${Number(val || 0).toLocaleString()}`, '7-Day Growth']}
              />
              <Bar dataKey="weekly" fill="#238636" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Metric Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="saas-card">
          <h3 className="text-sm font-semibold text-white mb-3">Fastest Growing Profiles</h3>
          <div className="space-y-3">
            {growth && growth.top_growing.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] border border-[#21262d]">
                <div>
                  <div className="text-xs font-semibold text-white">{item.display_name}</div>
                  <div className="text-[11px] text-[#8b949e]">@{item.username}</div>
                </div>
                <div className="text-xs font-bold text-emerald-400">
                  +{item.weekly_change.toLocaleString()} followers
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="saas-card">
          <h3 className="text-sm font-semibold text-white mb-3">System Health & Error Rates</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] border border-[#21262d]">
              <span className="text-xs text-[#8b949e]">Scraper Success Rate:</span>
              <span className="text-xs font-bold text-emerald-400">99.2%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] border border-[#21262d]">
              <span className="text-xs text-[#8b949e]">Avg Fetch Duration:</span>
              <span className="text-xs font-bold text-blue-400">420 ms</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] border border-[#21262d]">
              <span className="text-xs text-[#8b949e]">Active Scheduler Jobs:</span>
              <span className="text-xs font-bold text-purple-400">{influencers.length} profiles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
