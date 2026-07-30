from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Influencer(Base):
    __tablename__ = "influencers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=True)
    avatar_url = Column(Text, nullable=True)
    platform = Column(String(50), default="instagram", index=True)
    profile_url = Column(Text, nullable=True)
    follower_count = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    
    # Growth metrics
    today_change = Column(Integer, default=0)
    weekly_change = Column(Integer, default=0)
    monthly_change = Column(Integer, default=0)
    
    # Tracking configuration
    custom_label = Column(String(100), nullable=True)
    group_name = Column(String(100), nullable=True, index=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(String(255), nullable=True)  # Comma separated
    update_interval_hours = Column(Integer, default=24)
    priority = Column(Integer, default=1)  # 1: Normal, 2: High, 3: Urgent
    notes = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="active")  # active, paused, error, disabled
    last_updated = Column(DateTime, nullable=True)
    next_update = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    history = relationship("History", back_populates="influencer", cascade="all, delete-orphan")

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    influencer_id = Column(Integer, ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    follower_count = Column(Integer, nullable=False)
    follower_delta = Column(Integer, default=0)
    post_count = Column(Integer, default=0)
    status = Column(String(50), default="success")  # success, error, rate_limited
    duration_ms = Column(Integer, default=0)
    response_code = Column(Integer, default=200)
    error_message = Column(Text, nullable=True)

    influencer = relationship("Influencer", back_populates="history")

class AppSettings(Base):
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    influencer_id = Column(Integer, ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False, index=True)
    cron_expression = Column(String(100), nullable=True)
    interval_hours = Column(Integer, default=24)
    priority = Column(Integer, default=1)
    random_jitter_sec = Column(Integer, default=30)
    retry_count = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)

class LogEntry(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    level = Column(String(20), default="INFO", index=True)
    module = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)

class GoogleSyncLog(Base):
    __tablename__ = "google_sync"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sync_type = Column(String(50), default="manual")  # manual, auto, export, import
    rows_synced = Column(Integer, default=0)
    status = Column(String(50), default="success")  # success, error
    details = Column(Text, nullable=True)
