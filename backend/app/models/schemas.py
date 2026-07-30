from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime

# Influencer Schemas
class InfluencerBase(BaseModel):
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    platform: str = "instagram"
    profile_url: Optional[str] = None
    custom_label: Optional[str] = None
    group_name: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    update_interval_hours: int = 24
    priority: int = 1
    notes: Optional[str] = None

class InfluencerCreate(InfluencerBase):
    validate_profile: bool = True

class InfluencerUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    custom_label: Optional[str] = None
    group_name: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    update_interval_hours: Optional[int] = None
    priority: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class InfluencerResponse(InfluencerBase):
    id: int
    follower_count: int
    post_count: int
    bio: Optional[str] = None
    today_change: int
    weekly_change: int
    monthly_change: int
    status: str
    last_updated: Optional[datetime] = None
    next_update: Optional[datetime] = None
    last_error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# History Schemas
class HistoryResponse(BaseModel):
    id: int
    influencer_id: int
    timestamp: datetime
    follower_count: int
    follower_delta: int
    post_count: int
    status: str
    duration_ms: int
    response_code: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_influencers: int
    total_followers_tracked: int
    today_updates_count: int
    successful_fetches_count: int
    failed_fetches_count: int
    google_sync_status: str
    scheduler_status: str
    latest_activity: List[dict]

# Settings Schemas
class ScraperSettingsSchema(BaseModel):
    headless: bool = True
    timeout_ms: int = 30000
    max_retries: int = 3
    min_delay_sec: float = 2.0
    max_delay_sec: float = 5.0
    concurrent_workers: int = 2
    user_agent: Optional[str] = None

class GoogleSettingsSchema(BaseModel):
    sheets_id: str = ""
    credentials_json: Optional[str] = None
    auto_sync: bool = False
    sync_interval_min: int = 60

class SystemSettingsSchema(BaseModel):
    theme: str = "dark"
    accent_color: str = "indigo"
    log_level: str = "INFO"

# Bulk Operations
class BulkImportRequest(BaseModel):
    identifiers: List[str]
    group_name: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    update_interval_hours: int = 24
