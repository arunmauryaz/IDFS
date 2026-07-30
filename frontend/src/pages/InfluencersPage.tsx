import React, { useState } from 'react';
import { InfluencerTable } from '../components/influencers/InfluencerTable';
import type { Influencer } from '../types';
import { Filter, Download, Plus } from 'lucide-react';

interface InfluencersPageProps {
  influencers: Influencer[];
  onFetchNow: (id: number) => void;
  onEdit: (influencer: Influencer) => void;
  onDelete: (id: number) => void;
  onOpenAddModal: () => void;
  onExport: () => void;
  onSelectInfluencer: (id: number) => void;
  onToggleStatus: (influencer: Influencer) => void;
  onBulkAction: (action: 'start' | 'stop' | 'fetch' | 'delete', ids: number[]) => void;
}

export const InfluencersPage: React.FC<InfluencersPageProps> = ({
  influencers,
  onFetchNow,
  onEdit,
  onDelete,
  onOpenAddModal,
  onExport,
  onSelectInfluencer,
  onToggleStatus,
  onBulkAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter categories
  const categories = ['ALL', ...Array.from(new Set(influencers.map(i => i.category || 'General')))];

  const filteredInfluencers = selectedCategory === 'ALL'
    ? influencers
    : influencers.filter(i => (i.category || 'General') === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#8b949e]" />
          <span className="text-xs text-[#8b949e] font-medium mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1f6feb] text-white'
                  : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#21262d] hover:text-white border border-[#30363d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="saas-button-secondary text-xs cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <button onClick={onOpenAddModal} className="saas-button-primary text-xs cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add Profile
          </button>
        </div>
      </div>

      {/* Main Influencers Table */}
      <InfluencerTable
        influencers={filteredInfluencers}
        onFetchNow={onFetchNow}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelectInfluencer={onSelectInfluencer}
        onToggleStatus={onToggleStatus}
        onBulkAction={onBulkAction}
      />
    </div>
  );
};
