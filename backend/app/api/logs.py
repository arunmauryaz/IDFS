from fastapi import APIRouter, Query
from app.services.logging_service import get_recent_logs, clear_logs_buffer

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("")
def get_logs(limit: int = Query(100), level: str = Query("ALL")):
    return get_recent_logs(limit=limit, level_filter=level)

@router.delete("/clear")
def clear_logs():
    clear_logs_buffer()
    return {"message": "Logs cleared successfully."}
