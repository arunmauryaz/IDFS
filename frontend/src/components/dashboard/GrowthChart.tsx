import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
  data: { date: string; total_followers: number }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const formatYAxis = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  return (
    <div className="saas-card h-80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Aggregated Follower Growth</h3>
          <p className="text-xs text-[#8b949e]">Historical total follower trend (7-day timeline)</p>
        </div>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1f6feb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="date" stroke="#8b949e" fontSize={11} tickLine={false} />
            <YAxis stroke="#8b949e" fontSize={11} tickFormatter={formatYAxis} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '0.375rem', fontSize: '12px' }}
              labelStyle={{ color: '#f0f6fc', fontWeight: 'bold' }}
              formatter={(val: any) => [Number(val || 0).toLocaleString() + ' followers', 'Total']}
            />
            <Area
              type="monotone"
              dataKey="total_followers"
              stroke="#58a6ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#followerGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
