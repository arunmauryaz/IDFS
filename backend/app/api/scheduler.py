from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.scheduler_service import scheduler_service
from app.services.database_service import DatabaseService

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])

@router.get("/status")
def get_scheduler_status(db: Session = Depends(get_db)):
    is_paused = DatabaseService.get_setting(db, "fetching_paused", "false").lower() == "true"
    interval = int(DatabaseService.get_setting(db, "fetching_interval_min", "5"))
    batch_size = int(DatabaseService.get_setting(db, "fetching_batch_size", "1"))
    
    return {
        "status": "paused" if is_paused else "running",
        "is_paused": is_paused,
        "interval_minutes": interval,
        "batch_size": batch_size
    }

@router.post("/update")
def update_scheduler_config(data: dict = Body(...), db: Session = Depends(get_db)):
    interval = int(data.get("interval_minutes", 5))
    batch_size = int(data.get("batch_size", 1))
    is_paused = bool(data.get("is_paused", False))

    DatabaseService.set_setting(db, "fetching_interval_min", str(interval))
    DatabaseService.set_setting(db, "fetching_batch_size", str(batch_size))
    DatabaseService.set_setting(db, "fetching_paused", str(is_paused).lower())

    scheduler_service.update_config(interval_minutes=interval, batch_size=batch_size, is_paused=is_paused)

    return {
        "message": "Fetching configuration updated successfully.",
        "status": "paused" if is_paused else "running",
        "interval_minutes": interval,
        "batch_size": batch_size
    }

@router.post("/fetch-all")
async def trigger_fetch_all():
    return await scheduler_service.fetch_all_influencers()
