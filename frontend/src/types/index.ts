export interface Influencer {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  platform: string;
  profile_url?: string;
  follower_count: number;
  post_count: number;
  bio?: string;
  today_change: number;
  weekly_change: number;
  monthly_change: number;
  custom_label?: string;
  group_name?: string;
  category?: string;
  tags?: string;
  update_interval_hours: number;
  priority: number;
  notes?: string;
  status: 'active' | 'paused' | 'error' | 'disabled';
  last_updated?: string;
  next_update?: string;
  last_error?: string;
  created_at: string;
}

export interface HistoryRecord {
  id: number;
  influencer_id: number;
  timestamp: string;
  follower_count: number;
  follower_delta: number;
  post_count: number;
  status: string;
  duration_ms: number;
  response_code: number;
  error_message?: string;
}

export interface DashboardStats {
  total_influencers: number;
  total_followers_tracked: number;
  today_updates_count: number;
  successful_fetches_count: number;
  failed_fetches_count: number;
  google_sync_status: string;
  scheduler_status: string;
  latest_activity: {
    id: number;
    timestamp: string;
    username: string;
    follower_count: number;
    delta: number;
    status: string;
  }[];
}

export interface GrowthAnalytics {
  top_growing: {
    username: string;
    display_name: string;
    avatar_url?: string;
    followers: number;
    weekly_change: number;
    today_change: number;
  }[];
  largest_drop?: {
    username: string;
    display_name: string;
    weekly_change: number;
  };
  average_growth: number;
  chart_data: {
    date: string;
    total_followers: number;
  }[];
  summary: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  details?: string;
}
