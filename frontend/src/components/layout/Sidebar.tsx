import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  History, 
  Settings, 
  Camera,
  RefreshCw,
  Download
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSyncGoogle: () => void;
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSyncGoogle,
  onExport
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'influencers', label: 'Influencers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'history', label: 'History Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#010409] border-r border-[#30363d] flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-md">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-wide">Tracker SaaS</h1>
            <p className="text-[11px] text-[#8b949e]">Instagram Analytics v1.0</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-[#1f6feb] text-white shadow-sm' 
                    : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#f0f6fc]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Footer */}
      <div className="p-3 border-t border-[#30363d] space-y-2 bg-[#090d13]">
        <button
          onClick={onSyncGoogle}
          className="w-full saas-button-secondary py-2 justify-center text-xs text-[#58a6ff] hover:bg-[#161b22]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Google Sheets Sync
        </button>
        <button
          onClick={onExport}
          className="w-full saas-button-secondary py-2 justify-center text-xs text-[#8b949e]"
        >
          <Download className="w-3.5 h-3.5" />
          Export Reports
        </button>
      </div>
    </aside>
  );
};
