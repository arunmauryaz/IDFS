from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.models.db_models import Influencer, History, LogEntry, GoogleSyncLog

class AnalyticsService:
    @staticmethod
    def get_dashboard_overview(db: Session) -> Dict[str, Any]:
        total_influencers = db.query(func.count(Influencer.id)).scalar() or 0
        total_followers = db.query(func.sum(Influencer.follower_count)).scalar() or 0

        # Updates today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_updates = db.query(func.count(History.id)).filter(History.timestamp >= today_start).scalar() or 0
        successful_fetches = db.query(func.count(History.id)).filter(
            History.timestamp >= today_start,
            History.status == "success"
        ).scalar() or 0
        failed_fetches = db.query(func.count(History.id)).filter(
            History.timestamp >= today_start,
            History.status != "success"
        ).scalar() or 0

        # Sync & Scheduler Status
        google_sync_status = "Connected"
        scheduler_status = "Running"

        # Latest activities
        recent_history = db.query(History).order_by(desc(History.timestamp)).limit(5).all()
        activities = []
        for h in recent_history:
            inf = db.query(Influencer).filter(Influencer.id == h.influencer_id).first()
            username = inf.username if inf else "Unknown"
            activities.append({
                "id": h.id,
                "timestamp": h.timestamp.isoformat(),
                "username": username,
                "follower_count": h.follower_count,
                "delta": h.follower_delta,
                "status": h.status
            })

        return {
            "total_influencers": total_influencers,
            "total_followers_tracked": total_followers,
            "today_updates_count": today_updates,
            "successful_fetches_count": successful_fetches,
            "failed_fetches_count": failed_fetches,
            "google_sync_status": google_sync_status,
            "scheduler_status": scheduler_status,
            "latest_activity": activities
        }

    @staticmethod
    def get_growth_analytics(db: Session) -> Dict[str, Any]:
        influencers = db.query(Influencer).all()
        
        # Top growing accounts
        top_growing = sorted(influencers, key=lambda i: i.weekly_change, reverse=True)[:5]
        top_growing_list = [
            {
                "username": i.username,
                "display_name": i.display_name,
                "avatar_url": i.avatar_url,
                "followers": i.follower_count,
                "weekly_change": i.weekly_change,
                "today_change": i.today_change
            }
            for i in top_growing
        ]

        # Largest drop
        largest_drop_item = min(influencers, key=lambda i: i.weekly_change) if influencers else None
        largest_drop = {
            "username": largest_drop_item.username,
            "display_name": largest_drop_item.display_name,
            "weekly_change": largest_drop_item.weekly_change
        } if largest_drop_item and largest_drop_item.weekly_change < 0 else None

        # Average growth
        total_weekly_change = sum(i.weekly_change for i in influencers)
        avg_growth = total_weekly_change / len(influencers) if influencers else 0

        # Timeline aggregate history for graph
        # Last 7 days chart points
        chart_data = []
        now = datetime.utcnow()
        for d in range(6, -1, -1):
            date_point = now - timedelta(days=d)
            date_str = date_point.strftime("%b %d")
            
            # Fetch histories on or before this day
            sub_count = 0
            for i in influencers:
                h = db.query(History).filter(
                    History.influencer_id == i.id,
                    History.timestamp <= date_point
                ).order_by(desc(History.timestamp)).first()
                if h:
                    sub_count += h.follower_count
                else:
                    sub_count += i.follower_count

            chart_data.append({
                "date": date_str,
                "total_followers": sub_count
            })

        # Summary text
        summary = (
            f"Currently tracking {len(influencers)} influencers with a total reach of {sum(i.follower_count for i in influencers):,} followers. "
            f"Average 7-day growth is {int(avg_growth):+} followers per profile."
        )

        return {
            "top_growing": top_growing_list,
            "largest_drop": largest_drop,
            "average_growth": round(avg_growth, 2),
            "chart_data": chart_data,
            "summary": summary
        }
