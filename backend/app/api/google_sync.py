from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.google_sheets_service import GoogleSheetsService
from app.services.database_service import DatabaseService

router = APIRouter(prefix="/google-sync", tags=["Google Sync"])

@router.post("/test-connection")
def test_connection(data: dict = Body(...), db: Session = Depends(get_db)):
    sheets_id = data.get("sheets_id") or DatabaseService.get_setting(db, "google_sheets_id")
    creds_json = data.get("credentials_json")
    return GoogleSheetsService.test_connection(sheets_id, db=db, creds_json=creds_json)

@router.post("/sync-now")
def sync_now(data: dict = Body(default={}), db: Session = Depends(get_db)):
    sheets_id = data.get("sheets_id") or DatabaseService.get_setting(db, "google_sheets_id")
    return GoogleSheetsService.sync_influencers_to_sheet(db, sheets_id)
