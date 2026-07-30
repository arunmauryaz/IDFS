# Instagram Influencer Tracker - Product Plan & Roadmap

## Architecture Summary
- **Backend Framework**: Python FastAPI (`backend/app/main.py`)
- **Scraper Engine**: Async Playwright (`backend/app/services/scraper_service.py`)
- **Scheduler**: APScheduler (`backend/app/services/scheduler_service.py`)
- **Database**: SQLite with SQLAlchemy ORM (`database/influencers.db`)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Recharts (`frontend/`)

## Completed Milestones
- [x] SQLite database schema with `Influencers`, `History`, `Settings`, `Schedules`, `Logs`, `GoogleSync`
- [x] Playwright scraper service with fallback fallback data generator
- [x] Multi-platform extensible scraper architecture (`BasePlatformScraper`)
- [x] Growth analytics engine calculating daily, 7-day, and 30-day deltas
- [x] Bulk import & multi-format export engine (CSV, XLSX, JSON)
- [x] Google Sheets API integration module
- [x] Professional dark-theme SaaS dashboard UI (Linear / Notion style)
- [x] Live log tail console and system configuration controls
- [x] Unified launcher script (`start_app.py`)

## Future Platform Roadmap
- [ ] **YouTube Platform Module**: Implement `YouTubeScraper(BasePlatformScraper)` using YouTube Data API v3.
- [ ] **TikTok Platform Module**: Implement `TikTokScraper(BasePlatformScraper)` using Playwright web scraper.
- [ ] **X / Twitter Module**: Implement `XScraper(BasePlatformScraper)`.
- [ ] **LinkedIn Module**: Implement `LinkedInScraper(BasePlatformScraper)`.
