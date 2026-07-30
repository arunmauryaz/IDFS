# Instagram Influencer Tracker (SaaS Application)

A professional desktop-grade application to monitor Instagram influencer follower counts, profile updates, growth deltas, and export analytics. Built with **Python 3.12+ (FastAPI + Playwright + SQLite + APScheduler)** and **React 18 + TypeScript + Vite + Tailwind CSS + Recharts**.

---

## 🌟 Key Features

* **Unlimited Profiles**: Track any public Instagram account with custom categories, tags, priority levels, and custom update intervals.
* **Automated & Manual Scraping**: Dynamic Playwright browser scraper with rate-limit protection, random jitter delays, backoff strategies, and offline fallback mode.
* **Growth Analytics & Deltas**: Automatically calculates daily, 7-day, and 30-day follower deltas and percentages.
* **Interactive Recharts Dashboard**: Visual growth timeline charts, top growing accounts, largest decline highlights, and real-time fetch activity feeds.
* **Google Sheets Integration**: 1-click test connection, manual sync, and automatic periodic synchronization of tracked profiles directly to Google Sheets.
* **Multi-Format Export**: Export full analytics reports to CSV, Excel (`.xlsx`), JSON, or Google Sheets.
* **Extensible Multi-Platform Architecture**: Clean `BasePlatformScraper` interface ready to support YouTube, TikTok, X, and LinkedIn modules.
* **SaaS Dark Mode UI**: Inspired by GitHub Desktop, Linear, Notion, and VS Code.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & **npm**

### Running the Application

To launch both the Python backend and React frontend with a single command:

```bash
python start_app.py
```

* **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📁 Project Structure

```
instagram-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── api/                     # REST API route handlers
│   │   ├── core/                    # Database connection & base platform scraper
│   │   ├── models/                  # SQLAlchemy models & Pydantic schemas
│   │   └── services/                # Scraper, Scheduler, Analytics, Google Sheets services
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/              # Table, charts, modals, header, sidebar
│   │   ├── pages/                   # Dashboard, Influencers, Analytics, History, Settings, Logs
│   │   ├── services/                # Axios API client
│   │   ├── types/                   # TypeScript interface definitions
│   │   └── index.css                # Dark mode SaaS design system
│   └── package.json
├── database/                        # SQLite database (influencers.db)
├── logs/                            # Application logs (app.log)
├── config/                          # Configuration & Google Service Account JSON
├── exports/                         # Generated CSV/Excel/JSON reports
├── docs/                            # Developer documentation
├── start_app.py                     # Unified launcher
├── README.md
└── PLAN.md
```

---

## 🔐 Google Sheets Integration Setup

1. Place your Google Service Account JSON file in `config/service_account.json`.
2. Open the **Settings** tab in the dashboard and enter your **Google Sheet ID**.
3. Click **Test Connection** or **Google Sheets Sync**.
