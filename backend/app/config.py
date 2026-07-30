import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_DIR = BASE_DIR / "database"
LOGS_DIR = BASE_DIR / "logs"
CONFIG_DIR = BASE_DIR / "config"
EXPORTS_DIR = BASE_DIR / "exports"

# Create directories if they do not exist
for folder in [DB_DIR, LOGS_DIR, CONFIG_DIR, EXPORTS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "Instagram Influencer Tracker"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = f"sqlite:///{DB_DIR / 'influencers.db'}"
    
    # Scraper defaults
    SCRAPER_HEADLESS: bool = True
    SCRAPER_TIMEOUT_MS: int = 30000
    SCRAPER_MAX_RETRIES: int = 3
    SCRAPER_MIN_DELAY_SEC: float = 2.0
    SCRAPER_MAX_DELAY_SEC: float = 5.0
    SCRAPER_CONCURRENT_WORKERS: int = 2
    
    # Google Sheets defaults
    GOOGLE_SHEETS_ID: str = ""
    GOOGLE_CREDENTIALS_FILE: str = str(CONFIG_DIR / "service_account.json")
    GOOGLE_AUTO_SYNC: bool = False
    GOOGLE_SYNC_INTERVAL_MIN: int = 60
    
    # App theme
    APP_THEME: str = "dark"
    ACCENT_COLOR: str = "indigo"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
