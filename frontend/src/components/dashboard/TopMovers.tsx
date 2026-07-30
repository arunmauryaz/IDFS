import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { AvatarImage } from '../common/AvatarImage';

interface TopMoversProps {
  topGrowing: {
    username: string;
    display_name: string;
    avatar_url?: string;
    followers: number;
    weekly_change: number;
    today_change: number;
  }[];
  largestDrop?: {
    username: string;
    display_name: string;
    weekly_change: number;
  };
}

export const TopMovers: React.FC<TopMoversProps> = ({ topGrowing, largestDrop }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Top 5 Growing Accounts */}
      <div className="saas-card lg:col-span-2 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Top Growing Accounts (7-Day)</h3>
          </div>
        </div>

        <div className="space-y-2">
          {topGrowing.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-md hover:bg-[#1c2128] transition-colors border border-[#21262d]">
              <div className="flex items-center gap-3">
                <AvatarImage
                  src={item.avatar_url}
                  username={item.username}
                  className="w-8 h-8 rounded-full border border-[#30363d] bg-[#0d1117] object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-white">{item.display_name}</div>
                  <div className="text-[11px] text-[#8b949e]">@{item.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3" />
                  +{item.weekly_change.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#8b949e]">{item.followers.toLocaleString()} total</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Largest Drop Card */}
      <div className="saas-card flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">Largest Decline</h3>
          </div>

          {largestDrop ? (
            <div className="p-4 rounded-md bg-[#1f191b] border border-rose-900/40 mt-2">
              <div className="text-xs text-[#8b949e]">Account:</div>
              <div className="text-sm font-bold text-white mt-1">@{largestDrop.username}</div>
              <div className="text-xs text-rose-400 font-semibold mt-2">
                {largestDrop.weekly_change.toLocaleString()} followers (7 days)
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#8b949e]">
              No follower declines recorded across tracked profiles.
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-[#0d1117] rounded-md border border-[#21262d] text-[11px] text-[#8b949e]">
          💡 <span className="text-white font-medium">Growth Tip:</span> Accounts updating twice daily reflect 98% higher accuracy in micro-spike detection.
        </div>
      </div>
    </div>
  );
};
