from fastapi import APIRouter
from app.api.influencers import router as influencers_router
from app.api.analytics import router as analytics_router
from app.api.history import router as history_router
from app.api.scheduler import router as scheduler_router
from app.api.settings import router as settings_router
from app.api.google_sync import router as google_sync_router
from app.api.export import router as export_router
from app.api.logs import router as logs_router

api_router = APIRouter()
api_router.include_router(influencers_router)
api_router.include_router(analytics_router)
api_router.include_router(history_router)
api_router.include_router(scheduler_router)
api_router.include_router(settings_router)
api_router.include_router(google_sync_router)
api_router.include_router(export_router)
api_router.include_router(logs_router)
