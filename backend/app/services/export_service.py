import json
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from app.config import EXPORTS_DIR
from app.models.db_models import Influencer, History
from app.services.logging_service import add_log_buffer

class ExportService:
    @staticmethod
    def export_influencers(db: Session, export_format: str = "csv") -> Dict[str, Any]:
        export_format = export_format.lower()
        influencers = db.query(Influencer).all()
        
        data = []
        for inf in influencers:
            data.append({
                "ID": inf.id,
                "Username": inf.username,
                "Display Name": inf.display_name,
                "Platform": inf.platform,
                "Profile URL": inf.profile_url,
                "Follower Count": inf.follower_count,
                "Post Count": inf.post_count,
                "Today Change": inf.today_change,
                "Weekly Change": inf.weekly_change,
                "Monthly Change": inf.monthly_change,
                "Category": inf.category,
                "Group": inf.group_name,
                "Tags": inf.tags,
                "Priority": inf.priority,
                "Status": inf.status,
                "Last Updated": inf.last_updated.isoformat() if inf.last_updated else "",
                "Next Update": inf.next_update.isoformat() if inf.next_update else ""
            })

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        
        if export_format == "json":
            file_name = f"influencers_export_{timestamp}.json"
            file_path = EXPORTS_DIR / file_name
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
                
        elif export_format == "excel" or export_format == "xlsx":
            file_name = f"influencers_export_{timestamp}.xlsx"
            file_path = EXPORTS_DIR / file_name
            df = pd.DataFrame(data)
            df.to_excel(file_path, index=False)
            
        else: # Default CSV
            file_name = f"influencers_export_{timestamp}.csv"
            file_path = EXPORTS_DIR / file_name
            df = pd.DataFrame(data)
            df.to_csv(file_path, index=False)

        add_log_buffer("INFO", "ExportService", f"Exported {len(influencers)} influencers to {file_name}")
        return {
            "file_name": file_name,
            "file_path": str(file_path),
            "format": export_format,
            "rows": len(influencers)
        }
