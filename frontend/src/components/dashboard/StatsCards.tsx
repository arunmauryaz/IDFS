import React from 'react';
import { Users, Eye, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import type { DashboardStats } from '../../types';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Influencers',
      value: stats ? stats.total_influencers : 0,
      icon: Users,
      color: 'text-indigo-400',
      subText: 'Monitored profiles'
    },
    {
      title: 'Followers Tracked',
      value: stats ? stats.total_followers_tracked.toLocaleString() : '0',
      icon: Eye,
      color: 'text-blue-400',
      subText: 'Combined reach'
    },
    {
      title: "Today's Updates",
      value: stats ? stats.today_updates_count : 0,
      icon: Clock,
      color: 'text-purple-400',
      subText: 'Executed fetches'
    },
    {
      title: 'Successful Fetches',
      value: stats ? stats.successful_fetches_count : 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      subText: '100% data extracted'
    },
    {
      title: 'Failed Fetches',
      value: stats ? stats.failed_fetches_count : 0,
      icon: AlertTriangle,
      color: 'text-rose-400',
      subText: 'Rate limits / errors'
    },
    {
      title: 'Google Sync',
      value: stats ? stats.google_sync_status : 'Offline',
      icon: RefreshCw,
      color: 'text-amber-400',
      subText: 'Sheet status'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="saas-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8b949e] font-medium">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-[#8b949e] mt-0.5">{card.subText}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
