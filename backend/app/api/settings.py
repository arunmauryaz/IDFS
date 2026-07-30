from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.config import settings as app_config
from app.models.schemas import ScraperSettingsSchema, GoogleSettingsSchema, SystemSettingsSchema
from app.services.database_service import DatabaseService
from app.services.scheduler_service import scheduler_service

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_all_settings(db: Session = Depends(get_db)):
    return {
        "scraper": {
            "headless": app_config.SCRAPER_HEADLESS,
            "timeout_ms": app_config.SCRAPER_TIMEOUT_MS,
            "max_retries": app_config.SCRAPER_MAX_RETRIES,
            "min_delay_sec": app_config.SCRAPER_MIN_DELAY_SEC,
            "max_delay_sec": app_config.SCRAPER_MAX_DELAY_SEC,
            "concurrent_workers": app_config.SCRAPER_CONCURRENT_WORKERS
        },
        "google": {
            "sheets_id": DatabaseService.get_setting(db, "google_sheets_id", app_config.GOOGLE_SHEETS_ID),
            "credentials_json": DatabaseService.get_setting(db, "google_credentials_json", ""),
            "auto_sync": DatabaseService.get_setting(db, "google_auto_sync", "false").lower() == "true",
            "sync_interval_min": int(DatabaseService.get_setting(db, "google_sync_interval_min", "60"))
        },
        "system": {
            "theme": DatabaseService.get_setting(db, "app_theme", app_config.APP_THEME),
            "accent_color": DatabaseService.get_setting(db, "accent_color", app_config.ACCENT_COLOR),
            "log_level": DatabaseService.get_setting(db, "log_level", "INFO")
        }
    }

@router.post("/scraper")
def update_scraper_settings(data: ScraperSettingsSchema):
    app_config.SCRAPER_HEADLESS = data.headless
    app_config.SCRAPER_TIMEOUT_MS = data.timeout_ms
    app_config.SCRAPER_MAX_RETRIES = data.max_retries
    app_config.SCRAPER_MIN_DELAY_SEC = data.min_delay_sec
    app_config.SCRAPER_MAX_DELAY_SEC = data.max_delay_sec
    app_config.SCRAPER_CONCURRENT_WORKERS = data.concurrent_workers
    return {"message": "Scraper settings updated successfully."}

@router.post("/google")
def update_google_settings(data: GoogleSettingsSchema, db: Session = Depends(get_db)):
    DatabaseService.set_setting(db, "google_sheets_id", data.sheets_id)
    if data.credentials_json is not None:
        DatabaseService.set_setting(db, "google_credentials_json", data.credentials_json)
    DatabaseService.set_setting(db, "google_auto_sync", str(data.auto_sync))
    DatabaseService.set_setting(db, "google_sync_interval_min", str(data.sync_interval_min))
    
    # Update background scheduler job for Google Sync
    scheduler_service.update_google_sync_job(data.sync_interval_min, data.auto_sync)
    return {"message": "Google Sheets settings & sync timer updated successfully."}

@router.post("/system")
def update_system_settings(data: SystemSettingsSchema, db: Session = Depends(get_db)):
    DatabaseService.set_setting(db, "app_theme", data.theme)
    DatabaseService.set_setting(db, "accent_color", data.accent_color)
    DatabaseService.set_setting(db, "log_level", data.log_level)
    return {"message": "System settings updated successfully."}

@router.post("/db/vacuum")
def vacuum_database(db: Session = Depends(get_db)):
    db.execute("VACUUM;")
    return {"message": "Database vacuum completed successfully."}
