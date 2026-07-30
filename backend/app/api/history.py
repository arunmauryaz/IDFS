from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.schemas import HistoryResponse
from app.services.database_service import DatabaseService

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[HistoryResponse])
def get_history(
    influencer_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    return DatabaseService.get_history(db, influencer_id=influencer_id, limit=limit)
