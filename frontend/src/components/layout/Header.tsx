import React from 'react';
import { Search, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenAddModal,
  searchQuery,
  setSearchQuery,
}) => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    influencers: 'Influencer Management',
    analytics: 'Growth Analytics & Insights',
    history: 'Update History Log',
    settings: 'System & Fetching Settings',
  };

  return (
    <header className="h-16 border-b border-[#30363d] bg-[#161b22] px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-semibold text-white capitalize">{titles[activeTab] || activeTab}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search profiles, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="saas-input pl-9 w-64 text-xs"
          />
        </div>

        {/* Add Influencer Button */}
        <button
          onClick={onOpenAddModal}
          className="saas-button-primary text-xs py-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Influencer
        </button>
      </div>
    </header>
  );
};
