import axios from 'axios';
import type { Influencer, HistoryRecord, DashboardStats, GrowthAnalytics, LogEntry } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const InfluencerService = {
  getInfluencers: async (params?: {
    search?: string;
    category?: string;
    group_name?: string;
    platform?: string;
    status?: string;
  }): Promise<Influencer[]> => {
    const res = await api.get('/influencers', { params });
    return res.data;
  },

  getInfluencer: async (id: number): Promise<Influencer> => {
    const res = await api.get(`/influencers/${id}`);
    return res.data;
  },

  createInfluencer: async (data: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    platform?: string;
    category?: string;
    group_name?: string;
    tags?: string;
    update_interval_hours?: number;
    priority?: number;
    notes?: string;
  }): Promise<Influencer> => {
    const res = await api.post('/influencers', data);
    return res.data;
  },

  updateInfluencer: async (id: number, data: Partial<Influencer>): Promise<Influencer> => {
    const res = await api.put(`/influencers/${id}`, data);
    return res.data;
  },

  deleteInfluencer: async (id: number): Promise<void> => {
    await api.delete(`/influencers/${id}`);
  },

  triggerFetch: async (id: number): Promise<any> => {
    const res = await api.post(`/influencers/${id}/fetch`);
    return res.data;
  }
};

export const AnalyticsService = {
  getDashboardOverview: async (): Promise<DashboardStats> => {
    const res = await api.get('/analytics/dashboard-overview');
    return res.data;
  },

  getGrowthAnalytics: async (): Promise<GrowthAnalytics> => {
    const res = await api.get('/analytics/growth');
    return res.data;
  }
};

export const HistoryService = {
  getHistory: async (influencerId?: number, limit: number = 100): Promise<HistoryRecord[]> => {
    const res = await api.get('/history', {
      params: { influencer_id: influencerId, limit }
    });
    return res.data;
  }
};

export const SchedulerService = {
  getStatus: async () => {
    const res = await api.get('/scheduler/status');
    return res.data;
  }
};

export const SettingsService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateGoogle: async (data: any) => {
    const res = await api.post('/settings/google', data);
    return res.data;
  },

  vacuumDb: async () => {
    const res = await api.post('/settings/db/vacuum');
    return res.data;
  }
};

export const GoogleSyncService = {
  testConnection: async (sheets_id?: string, credentials_json?: string) => {
    const res = await api.post('/google-sync/test-connection', { sheets_id, credentials_json });
    return res.data;
  },

  syncNow: async (sheets_id?: string) => {
    const res = await api.post('/google-sync/sync-now', { sheets_id });
    return res.data;
  }
};

export const ExportService = {
  exportData: async (format: 'csv' | 'xlsx' | 'json' = 'csv') => {
    const response = await api.get('/export', {
      params: { format },
      responseType: 'blob',
    });

    // Create a Blob from the response data
    const blob = new Blob([response.data], {
      type: format === 'json' ? 'application/json' : format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv'
    });

    // Create a temporary link element to trigger browser download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from header or fallback
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('download', `influencers_export_${timestamp}.${format}`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export const LogsService = {
  getLogs: async (limit: number = 100, level: string = 'ALL'): Promise<LogEntry[]> => {
    const res = await api.get('/logs', { params: { limit, level } });
    return res.data;
  },

  clearLogs: async () => {
    const res = await api.delete('/logs/clear');
    return res.data;
  }
};
