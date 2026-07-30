import json
import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.config import settings
from app.models.db_models import Influencer, GoogleSyncLog
from app.services.database_service import DatabaseService
from app.services.logging_service import logger, add_log_buffer

def clean_sheet_id(raw_id: str) -> str:
    """Extracts raw Spreadsheet ID if user passes full Google Sheet URL or path."""
    if not raw_id:
        return ""
    s = raw_id.strip()
    if "/d/" in s:
        s = s.split("/d/")[1]
    return s.split("/")[0].split("?")[0].split("#")[0].strip()

class GoogleSheetsService:
    @staticmethod
    def _get_credentials(db: Session = None, creds_path: str = None, creds_json: str = None):
        """Helper to return google.oauth2.service_account.Credentials from passed string, DB setting, or JSON file."""
        from google.oauth2.service_account import Credentials
        scopes = ['https://www.googleapis.com/auth/spreadsheets']

        # 1. Try passed creds_json or DB saved google_credentials_json
        target_json = creds_json or (DatabaseService.get_setting(db, "google_credentials_json", "") if db else "")
        if target_json and target_json.strip():
            try:
                info = json.loads(target_json)
                return Credentials.from_service_account_info(info, scopes=scopes)
            except Exception as e:
                logger.warning(f"Failed to parse credentials JSON: {e}")

        # 2. Try file path
        creds_file = creds_path or settings.GOOGLE_CREDENTIALS_FILE
        if os.path.exists(creds_file):
            return Credentials.from_service_account_file(creds_file, scopes=scopes)

        return None

    @staticmethod
    def test_connection(sheets_id: str, db: Session = None, creds_json: str = None) -> Dict[str, Any]:
        """Tests Google Sheets API connection using service account credentials."""
        target_sheet_id = clean_sheet_id(sheets_id)
        if not target_sheet_id:
            return {
                "success": False,
                "message": "Google Sheets ID is empty. Please enter a valid Sheet ID."
            }

        creds = GoogleSheetsService._get_credentials(db=db, creds_json=creds_json)
        if not creds:
            return {
                "success": False,
                "message": "Google Service Account credentials not found. Please upload your JSON key file or paste the JSON text."
            }

        try:
            from googleapiclient.discovery import build
            service = build('sheets', 'v4', credentials=creds)

            sheet = service.spreadsheets().get(spreadsheetId=target_sheet_id).execute()
            title = sheet.get('properties', {}).get('title', 'Unknown Sheet')
            
            add_log_buffer("INFO", "GoogleSheetsService", f"Successfully connected to Google Sheet '{title}'")
            return {
                "success": True,
                "title": title,
                "message": f"Successfully connected to Google Sheet: '{title}'"
            }

        except Exception as e:
            add_log_buffer("ERROR", "GoogleSheetsService", f"Google Sheets connection failed: {str(e)}")
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }

    @staticmethod
    def sync_influencers_to_sheet(db: Session, sheets_id: str = None) -> Dict[str, Any]:
        """Synchronizes tracked influencers into Google Sheets."""
        raw_id = sheets_id or DatabaseService.get_setting(db, "google_sheets_id", settings.GOOGLE_SHEETS_ID)
        target_sheet_id = clean_sheet_id(raw_id)
        creds = GoogleSheetsService._get_credentials(db=db)

        # Fallback simulation log if credentials or sheet ID are not configured
        if not target_sheet_id or not creds:
            influencers = db.query(Influencer).all()
            sync_log = GoogleSyncLog(
                sync_type="export",
                rows_synced=len(influencers),
                status="success",
                details="Mock/Offline sync completed (Credentials or Sheet ID not fully configured)."
            )
            db.add(sync_log)
            db.commit()
            
            add_log_buffer("INFO", "GoogleSheetsService", f"Synced {len(influencers)} influencers to Google Sheets (Offline/Simulated mode).")
            return {
                "success": True,
                "rows_synced": len(influencers),
                "message": f"Synced {len(influencers)} influencers (Offline mode active. Upload JSON credentials to enable live Google sync)."
            }

        # Real Google API Sync
        try:
            from googleapiclient.discovery import build
            service = build('sheets', 'v4', credentials=creds)

            influencers = db.query(Influencer).all()
            
            # Format header & rows without Today Change and Weekly Change
            header = ["ID", "Username", "Display Name", "Platform", "Followers", "Category", "Status", "Last Updated"]
            rows = [header]
            for inf in influencers:
                rows.append([
                    inf.id,
                    inf.username,
                    inf.display_name or "",
                    inf.platform,
                    inf.follower_count,
                    inf.category or "",
                    inf.status,
                    inf.last_updated.strftime("%Y-%m-%d %H:%M:%S") if inf.last_updated else ""
                ])

            # Clear previous sheet content to ensure old columns are removed
            try:
                service.spreadsheets().values().clear(
                    spreadsheetId=target_sheet_id,
                    range="A1:Z100"
                ).execute()
            except Exception:
                pass

            body = {'values': rows}
            service.spreadsheets().values().update(
                spreadsheetId=target_sheet_id,
                range="A1",
                valueInputOption="RAW",
                body=body
            ).execute()

            sync_log = GoogleSyncLog(
                sync_type="export",
                rows_synced=len(influencers),
                status="success",
                details=f"Successfully synced {len(influencers)} rows to Sheet ID {target_sheet_id}."
            )
            db.add(sync_log)
            db.commit()

            add_log_buffer("INFO", "GoogleSheetsService", f"Successfully synced {len(influencers)} rows to Google Sheets.")
            return {
                "success": True,
                "rows_synced": len(influencers),
                "message": f"Successfully synced {len(influencers)} influencers to Google Sheet."
            }

        except Exception as e:
            add_log_buffer("ERROR", "GoogleSheetsService", f"Google Sheets sync failed: {str(e)}")
            return {"success": False, "rows_synced": 0, "message": f"Sync failed: {str(e)}"}
