from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_overview(db)

@router.get("/growth")
def get_growth_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_growth_analytics(db)
