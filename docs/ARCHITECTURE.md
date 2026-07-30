# Technical Architecture & Extensibility Guide

## 1. Platform Extensibility Interface

The scraping architecture uses the standard **Strategy Pattern** via `BasePlatformScraper`:

```python
from app.core.base_scraper import BasePlatformScraper

class YouTubeScraper(BasePlatformScraper):
    @property
    def platform_name(self) -> str:
        return "youtube"

    async def fetch_profile(self, identifier: str) -> Dict[str, Any]:
        # Implement YouTube channel statistics fetching
        return {
            "username": identifier,
            "display_name": "Channel Name",
            "follower_count": 100000,
            "status": "success"
        }
```

To register a new platform, instantiate it in `ScraperService`:

```python
scraper_service.register_scraper(YouTubeScraper())
```

## 2. Scheduler & Priority Engine

Background profile updates are managed asynchronously by `APSchedulerService`.
Jobs are polled every 5 minutes and scheduled per influencer's `update_interval_hours` with priority-scaled random jitter delays to prevent rate limits.

## 3. Database Schema

The database uses SQLite located at `database/influencers.db`.
All tables are automatically created on startup via SQLAlchemy `init_db()`.
