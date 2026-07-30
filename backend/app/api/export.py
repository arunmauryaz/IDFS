from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from app.core.database import get_db
from app.services.export_service import ExportService
from app.config import EXPORTS_DIR

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("")
def export_data(format: str = Query("csv"), db: Session = Depends(get_db)):
    result = ExportService.export_influencers(db, export_format=format)
    file_path = Path(result["file_path"])
    file_name = result["file_name"]
    
    media_type = "text/csv"
    if format == "xlsx" or format == "excel":
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif format == "json":
        media_type = "application/json"

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={file_name}"}
    )

@router.get("/download/{file_name}")
def download_file(file_name: str):
    file_path = EXPORTS_DIR / file_name
    if not file_path.exists():
        return {"error": "File not found"}
    return FileResponse(
        path=file_path,
        filename=file_name,
        headers={"Content-Disposition": f"attachment; filename={file_name}"}
    )
