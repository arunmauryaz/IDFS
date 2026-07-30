import asyncio
import random
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.core.database import SessionLocal
from app.services.database_service import DatabaseService
from app.services.scraper_service import scraper_service
from app.services.logging_service import logger, add_log_buffer

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
        self.interval_minutes = 5
        self.batch_size = 1

    def start(self, interval_minutes: int = 5, batch_size: int = 1):
        self.interval_minutes = interval_minutes
        self.batch_size = batch_size
        
        if not self.is_running:
            self.scheduler.start()
            self.is_running = True
            
        # Re-schedule interval job
        self.scheduler.add_job(
            self._batch_fetch_job,
            trigger=IntervalTrigger(minutes=self.interval_minutes),
            id="batch_fetch_job",
            replace_existing=True
        )
        add_log_buffer("INFO", "SchedulerService", f"Scheduler active: Fetching {self.batch_size} profile(s) every {self.interval_minutes} minutes.")

    def shutdown(self):
        if self.is_running:
            self.scheduler.shutdown(wait=False)
            self.is_running = False
            add_log_buffer("INFO", "SchedulerService", "Fetching scheduler paused.")

    def update_config(self, interval_minutes: int, batch_size: int, is_paused: bool = False):
        self.interval_minutes = interval_minutes
        self.batch_size = batch_size
        
        if is_paused:
            if self.is_running:
                self.scheduler.remove_all_jobs()
                self.is_running = False
                add_log_buffer("INFO", "SchedulerService", "Scheduler paused by user setting.")
        else:
            self.start(interval_minutes, batch_size)

    def update_google_sync_job(self, interval_minutes: int, enabled: bool = True):
        """Schedules or updates automated background Google Sheets sync timer."""
        if not self.is_running:
            self.scheduler.start()
            self.is_running = True

        if enabled and interval_minutes > 0:
            self.scheduler.add_job(
                self._google_sync_job,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id="google_sync_job",
                replace_existing=True
            )
            add_log_buffer("INFO", "SchedulerService", f"Google Sheets auto-sync scheduled every {interval_minutes} minutes.")
        else:
            if self.scheduler.get_job("google_sync_job"):
                self.scheduler.remove_job("google_sync_job")
                add_log_buffer("INFO", "SchedulerService", "Google Sheets auto-sync timer disabled.")

    async def _google_sync_job(self):
        """Automated background sync job for Google Sheets."""
        db = SessionLocal()
        try:
            from app.services.google_sheets_service import GoogleSheetsService
            res = GoogleSheetsService.sync_influencers_to_sheet(db)
            add_log_buffer("INFO", "SchedulerService", f"Automated Google Sync executed: {res.get('message')}")
        except Exception as e:
            logger.error(f"Error in automated Google sync job: {e}")
        finally:
            db.close()

    async def trigger_influencer_update(self, influencer_id: int) -> Dict[str, Any]:
        """Manually trigger an update for a single influencer immediately."""
        db = SessionLocal()
        try:
            influencer = DatabaseService.get_influencer_by_id(db, influencer_id)
            if not influencer:
                return {"status": "error", "message": f"Influencer #{influencer_id} not found."}

            add_log_buffer("INFO", "SchedulerService", f"Manual fetch triggered for @{influencer.username}")
            
            # Scrape profile
            result = await scraper_service.fetch_influencer(influencer.platform, influencer.username)
            
            # Update DB stats & history
            updated = DatabaseService.update_influencer_stats(db, influencer_id, result)
            
            return {
                "status": result.get("status", "success"),
                "username": influencer.username,
                "follower_count": updated.follower_count if updated else 0,
                "delta": result.get("follower_count", 0) - (influencer.follower_count or 0),
                "last_updated": updated.last_updated.isoformat() if updated and updated.last_updated else None
            }
        finally:
            db.close()

    async def fetch_all_influencers(self) -> Dict[str, Any]:
        """Manually trigger fetch for all active influencers."""
        db = SessionLocal()
        try:
            influencers = DatabaseService.get_influencers(db, limit=500, status_filter="active")
            count = 0
            for inf in influencers:
                result = await scraper_service.fetch_influencer(inf.platform, inf.username)
                DatabaseService.update_influencer_stats(db, inf.id, result)
                count += 1
                await asyncio.sleep(0.5)
            
            add_log_buffer("INFO", "SchedulerService", f"Completed manual fetch-all for {count} profile(s).")
            return {"status": "success", "count": count, "message": f"Fetched {count} profiles."}
        finally:
            db.close()

    async def _batch_fetch_job(self):
        """Batch fetch queue: Fetches `batch_size` profiles per interval tick in round-robin order."""
        db = SessionLocal()
        try:
            # Fetch active profiles ordered by oldest last_updated date
            influencers = DatabaseService.get_influencers(db, limit=500, status_filter="active")
            if not influencers:
                return

            # Sort by last_updated (oldest first)
            influencers_sorted = sorted(
                influencers,
                key=lambda x: x.last_updated if x.last_updated else datetime.min
            )

            # Pick top batch_size profiles
            batch = influencers_sorted[:self.batch_size]
            add_log_buffer("INFO", "SchedulerService", f"Executing interval fetch for batch of {len(batch)} profile(s)...")

            for inf in batch:
                await asyncio.sleep(1.0)
                result = await scraper_service.fetch_influencer(inf.platform, inf.username)
                DatabaseService.update_influencer_stats(db, inf.id, result)

        except Exception as e:
            logger.error(f"Error in batch fetch job: {e}")
            add_log_buffer("ERROR", "SchedulerService", f"Batch fetch error: {e}")
        finally:
            db.close()

scheduler_service = SchedulerService()
