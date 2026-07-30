import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { InfluencersPage } from './pages/InfluencersPage';
import { InfluencerDetailPage } from './pages/InfluencerDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

import { AddInfluencerModal } from './components/influencers/AddInfluencerModal';
import { EditInfluencerModal } from './components/influencers/EditInfluencerModal';

import { 
  InfluencerService, 
  AnalyticsService, 
  GoogleSyncService, 
  ExportService 
} from './services/api';
import type { Influencer, DashboardStats, GrowthAnalytics } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<number | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growth, setGrowth] = useState<GrowthAnalytics | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = async () => {
    try {
      const [infData, statsData, growthData] = await Promise.all([
        InfluencerService.getInfluencers({ search: searchQuery }),
        AnalyticsService.getDashboardOverview(),
        AnalyticsService.getGrowthAnalytics(),
      ]);
      setInfluencers(infData);
      setStats(statsData);
      setGrowth(growthData);
    } catch (err) {
      console.error("Error loading application state:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Actions
  const handleFetchNow = async (id: number) => {
    try {
      const res = await InfluencerService.triggerFetch(id);
      showToast(`Fetch completed for @${res.username}: ${res.follower_count.toLocaleString()} followers`);
      await loadData();
    } catch (err: any) {
      showToast('Error executing profile fetch.');
    }
  };

  const handleToggleStatus = async (inf: Influencer) => {
    const nextStatus = inf.status === 'active' ? 'paused' : 'active';
    try {
      await InfluencerService.updateInfluencer(inf.id, { status: nextStatus });
      showToast(`Service ${nextStatus === 'active' ? 'STARTED (ON)' : 'STOPPED (OFF)'} for @${inf.username}`);
      await loadData();
    } catch (err) {
      showToast('Failed to toggle status.');
    }
  };

  const handleBulkAction = async (action: 'start' | 'stop' | 'fetch' | 'delete', ids: number[]) => {
    if (ids.length === 0) return;

    if (action === 'start' || action === 'stop') {
      const newStatus = action === 'start' ? 'active' : 'paused';
      await Promise.all(ids.map(id => InfluencerService.updateInfluencer(id, { status: newStatus })));
      showToast(`Bulk ${action === 'start' ? 'Start' : 'Stop'} Service applied to ${ids.length} profiles.`);
    } else if (action === 'fetch') {
      showToast(`Triggering Live Fetch for ${ids.length} profiles...`);
      await Promise.all(ids.map(id => InfluencerService.triggerFetch(id)));
      showToast(`Bulk Live Fetch completed for ${ids.length} profiles.`);
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${ids.length} selected profiles?`)) {
        await Promise.all(ids.map(id => InfluencerService.deleteInfluencer(id)));
        showToast(`Deleted ${ids.length} profiles.`);
      }
    }
    await loadData();
  };

  const handleAddInfluencer = async (data: any) => {
    await InfluencerService.createInfluencer(data);
    showToast(`Successfully added influencer @${data.username}`);
    await loadData();
  };

  const handleUpdateInfluencer = async (id: number, data: Partial<Influencer>) => {
    await InfluencerService.updateInfluencer(id, data);
    showToast(`Influencer #${id} updated.`);
    await loadData();
  };

  const handleDeleteInfluencer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this influencer and its historical records?')) {
      await InfluencerService.deleteInfluencer(id);
      showToast('Influencer deleted.');
      if (selectedInfluencerId === id) {
        setSelectedInfluencerId(null);
      }
      await loadData();
    }
  };

  const handleSyncGoogle = async () => {
    showToast('Syncing with Google Sheets...');
    try {
      const res = await GoogleSyncService.syncNow();
      showToast(res.message);
    } catch (err) {
      showToast('Google Sheets sync failed.');
    }
  };

  const handleExport = async () => {
    try {
      showToast('Preparing CSV report download...');
      await ExportService.exportData('csv');
      showToast('CSV export downloaded successfully!');
    } catch (err) {
      showToast('Export failed.');
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedInfluencerId(null);
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161b22] border border-[#58a6ff] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSyncGoogle={handleSyncGoogle}
        onExport={handleExport}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={selectedInfluencerId ? 'influencer_detail' : activeTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="p-6 flex-1 overflow-y-auto">
          {selectedInfluencerId ? (
            <InfluencerDetailPage
              influencerId={selectedInfluencerId}
              onBack={() => setSelectedInfluencerId(null)}
              onEdit={(inf) => setEditingInfluencer(inf)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  growth={growth}
                  onNavigateToInfluencers={() => setActiveTab('influencers')}
                />
              )}

              {activeTab === 'influencers' && (
                <InfluencersPage
                  influencers={influencers}
                  onFetchNow={handleFetchNow}
                  onEdit={(inf) => setEditingInfluencer(inf)}
                  onDelete={handleDeleteInfluencer}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onExport={handleExport}
                  onSelectInfluencer={(id) => setSelectedInfluencerId(id)}
                  onToggleStatus={handleToggleStatus}
                  onBulkAction={handleBulkAction}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsPage growth={growth} influencers={influencers} />
              )}

              {activeTab === 'history' && <HistoryPage />}

              {activeTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddInfluencerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddInfluencer}
      />

      <EditInfluencerModal
        influencer={editingInfluencer}
        isOpen={!!editingInfluencer}
        onClose={() => setEditingInfluencer(null)}
        onUpdate={handleUpdateInfluencer}
      />
    </div>
  );
};

export default App;
