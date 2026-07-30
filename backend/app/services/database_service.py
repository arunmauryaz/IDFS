from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from app.models.db_models import Influencer, History, AppSettings, Schedule, LogEntry, GoogleSyncLog
from app.models.schemas import InfluencerCreate, InfluencerUpdate
from app.services.logging_service import logger, add_log_buffer

class DatabaseService:
    # --- Influencer Operations ---
    @staticmethod
    def get_influencers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        group_name: Optional[str] = None,
        platform: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[Influencer]:
        query = db.query(Influencer)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Influencer.username.ilike(search_term)) |
                (Influencer.display_name.ilike(search_term)) |
                (Influencer.tags.ilike(search_term)) |
                (Influencer.custom_label.ilike(search_term))
            )
        if category:
            query = query.filter(Influencer.category == category)
        if group_name:
            query = query.filter(Influencer.group_name == group_name)
        if platform:
            query = query.filter(Influencer.platform == platform)
        if status_filter:
            query = query.filter(Influencer.status == status_filter)

        return query.order_by(desc(Influencer.follower_count)).offset(skip).limit(limit).all()

    @staticmethod
    def get_influencer_by_id(db: Session, influencer_id: int) -> Optional[Influencer]:
        return db.query(Influencer).filter(Influencer.id == influencer_id).first()

    @staticmethod
    def get_influencer_by_username(db: Session, username: str, platform: str = "instagram") -> Optional[Influencer]:
        return db.query(Influencer).filter(
            Influencer.username.ilike(username),
            Influencer.platform == platform
        ).first()

    @staticmethod
    def create_influencer(db: Session, data: Dict[str, Any]) -> Influencer:
        influencer = Influencer(
            username=data.get("username"),
            display_name=data.get("display_name", data.get("username")),
            avatar_url=data.get("avatar_url"),
            platform=data.get("platform", "instagram"),
            profile_url=data.get("profile_url") or f"https://www.instagram.com/{data.get('username')}/",
            follower_count=data.get("follower_count", 0),
            post_count=data.get("post_count", 0),
            bio=data.get("bio", ""),
            custom_label=data.get("custom_label"),
            group_name=data.get("group_name"),
            category=data.get("category"),
            tags=data.get("tags"),
            update_interval_hours=data.get("update_interval_hours", 24),
            priority=data.get("priority", 1),
            notes=data.get("notes"),
            status="active",
            last_updated=datetime.utcnow(),
            next_update=datetime.utcnow() + timedelta(hours=data.get("update_interval_hours", 24))
        )
        db.add(influencer)
        db.commit()
        db.refresh(influencer)

        # Initial history record
        history = History(
            influencer_id=influencer.id,
            follower_count=influencer.follower_count,
            follower_delta=0,
            post_count=influencer.post_count,
            status="success",
            duration_ms=data.get("duration_ms", 100)
        )
        db.add(history)
        db.commit()

        add_log_buffer("INFO", "DatabaseService", f"Created influencer @{influencer.username}")
        return influencer

    @staticmethod
    def update_influencer(db: Session, influencer_id: int, updates: Dict[str, Any]) -> Optional[Influencer]:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            return None

        for key, value in updates.items():
            if value is not None and hasattr(influencer, key):
                setattr(influencer, key, value)

        influencer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(influencer)
        return influencer

    @staticmethod
    def update_influencer_stats(db: Session, influencer_id: int, fetch_result: Dict[str, Any]) -> Influencer:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            return None

        old_followers = influencer.follower_count
        raw_new_followers = fetch_result.get("follower_count", old_followers)
        is_live_api = fetch_result.get("is_live_api", False)

        # Stale HTML Cache Protection:
        # If fetch came from HTML fallback and returns a lower count than current db count, ignore the regression
        if not is_live_api and raw_new_followers < old_followers and old_followers > 0:
            new_followers = old_followers
            add_log_buffer("WARNING", "DatabaseService", f"Ignored stale HTML fallback regression ({old_followers} -> {raw_new_followers}) for @{influencer.username}")
        else:
            new_followers = raw_new_followers if raw_new_followers > 0 else old_followers

        delta = new_followers - old_followers

        # Update influencer fields
        influencer.follower_count = new_followers
        if fetch_result.get("post_count"):
            influencer.post_count = fetch_result.get("post_count")
        if fetch_result.get("display_name"):
            influencer.display_name = fetch_result.get("display_name")
        if fetch_result.get("avatar_url"):
            influencer.avatar_url = fetch_result.get("avatar_url")
        if fetch_result.get("bio"):
            influencer.bio = fetch_result.get("bio")

        status = fetch_result.get("status", "success")
        influencer.status = "active" if status == "success" else "error"
        influencer.last_error = fetch_result.get("error") if status != "success" else None
        influencer.last_updated = datetime.utcnow()
        influencer.next_update = datetime.utcnow() + timedelta(hours=influencer.update_interval_hours)

        # Recalculate today/weekly/monthly deltas
        InfluencerDatabaseService._update_growth_deltas(db, influencer)

        db.commit()

        # Add History record
        history = History(
            influencer_id=influencer.id,
            follower_count=new_followers,
            follower_delta=delta,
            post_count=influencer.post_count,
            status=status,
            duration_ms=fetch_result.get("duration_ms", 0),
            error_message=fetch_result.get("error")
        )
        db.add(history)
        db.commit()

        db.refresh(influencer)
        return influencer

    @staticmethod
    def _update_growth_deltas(db: Session, influencer: Influencer):
        now = datetime.utcnow()

        # Today (last 24 hours)
        day_ago = now - timedelta(days=1)
        prev_day = db.query(History).filter(
            History.influencer_id == influencer.id,
            History.timestamp <= day_ago
        ).order_by(desc(History.timestamp)).first()
        influencer.today_change = influencer.follower_count - prev_day.follower_count if prev_day else 0

        # Weekly (last 7 days)
        week_ago = now - timedelta(days=7)
        prev_week = db.query(History).filter(
            History.influencer_id == influencer.id,
            History.timestamp <= week_ago
        ).order_by(desc(History.timestamp)).first()
        influencer.weekly_change = influencer.follower_count - prev_week.follower_count if prev_week else 0

        # Monthly (last 30 days)
        month_ago = now - timedelta(days=30)
        prev_month = db.query(History).filter(
            History.influencer_id == influencer.id,
            History.timestamp <= month_ago
        ).order_by(desc(History.timestamp)).first()
        influencer.monthly_change = influencer.follower_count - prev_month.follower_count if prev_month else 0

        # Also cleanup history entries where delta regression was false from stale fallback if any
        pass

    @staticmethod
    def delete_influencer(db: Session, influencer_id: int) -> bool:
        influencer = db.query(Influencer).filter(Influencer.id == influencer_id).first()
        if not influencer:
            return False
        db.delete(influencer)
        db.commit()
        add_log_buffer("INFO", "DatabaseService", f"Deleted influencer #{influencer_id}")
        return True

    # --- History Operations ---
    @staticmethod
    def get_history(db: Session, influencer_id: Optional[int] = None, limit: int = 100) -> List[History]:
        query = db.query(History)
        if influencer_id:
            query = query.filter(History.influencer_id == influencer_id)
        return query.order_by(desc(History.timestamp)).limit(limit).all()

    # --- Settings Operations ---
    @staticmethod
    def get_setting(db: Session, key: str, default: str = "") -> str:
        s = db.query(AppSettings).filter(AppSettings.key == key).first()
        return s.value if s else default

    @staticmethod
    def set_setting(db: Session, key: str, value: str, description: str = None):
        s = db.query(AppSettings).filter(AppSettings.key == key).first()
        if not s:
            s = AppSettings(key=key, value=value, description=description)
            db.add(s)
        else:
            s.value = value
            if description:
                s.description = description
        db.commit()

class InfluencerDatabaseService(DatabaseService):
    pass
