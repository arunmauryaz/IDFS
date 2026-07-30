import html
import requests
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.models.schemas import InfluencerResponse, InfluencerCreate, InfluencerUpdate
from app.services.database_service import DatabaseService
from app.services.scraper_service import scraper_service, clean_username, clean_avatar_url
from app.services.scheduler_service import scheduler_service

router = APIRouter(prefix="/influencers", tags=["Influencers"])

@router.get("", response_model=List[InfluencerResponse])
def list_influencers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    group_name: Optional[str] = None,
    platform: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return DatabaseService.get_influencers(
        db, skip=skip, limit=limit, search=search,
        category=category, group_name=group_name, platform=platform, status_filter=status
    )

@router.get("/avatar-proxy")
def avatar_proxy(url: str = Query(...)):
    """Proxies remote avatar images to bypass cross-origin referrer restrictions."""
    try:
        clean_url = html.unescape(url).replace("&amp;", "&")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Referer": "https://www.instagram.com/",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
        res = requests.get(clean_url, headers=headers, timeout=8)
        if res.status_code == 200:
            content_type = res.headers.get("Content-Type", "image/jpeg")
            return Response(content=res.content, media_type=content_type)
    except Exception:
        pass
    raise HTTPException(status_code=404, detail="Avatar image fetch failed")

@router.post("", response_model=InfluencerResponse)
async def create_influencer(
    data: InfluencerCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    username = clean_username(data.username)
    if not username:
        raise HTTPException(status_code=400, detail="Invalid username or Instagram URL.")

    # Check if exists
    existing = DatabaseService.get_influencer_by_username(db, username, data.platform)
    if existing:
        raise HTTPException(status_code=400, detail=f"Influencer @{username} is already being tracked.")

    # Fetch initial stats
    fetch_result = await scraper_service.fetch_influencer(data.platform, username)
    if fetch_result.get("status") == "error" and data.validate_profile:
        raise HTTPException(status_code=400, detail=f"Validation failed: {fetch_result.get('error', 'Profile not found')}")

    # Use user provided avatar_url if present, else fallback to scraped avatar_url
    raw_avatar = data.avatar_url if data.avatar_url and data.avatar_url.strip() else fetch_result.get("avatar_url")
    final_avatar = clean_avatar_url(raw_avatar)

    influencer_data = {
        "username": username,
        "display_name": data.display_name or fetch_result.get("display_name", username),
        "avatar_url": final_avatar,
        "platform": data.platform,
        "follower_count": fetch_result.get("follower_count", 0),
        "post_count": fetch_result.get("post_count", 0),
        "bio": fetch_result.get("bio", ""),
        "custom_label": data.custom_label,
        "group_name": data.group_name,
        "category": data.category,
        "tags": data.tags,
        "update_interval_hours": data.update_interval_hours,
        "priority": data.priority,
        "notes": data.notes,
        "duration_ms": fetch_result.get("duration_ms", 100)
    }

    return DatabaseService.create_influencer(db, influencer_data)

@router.get("/{influencer_id}", response_model=InfluencerResponse)
def get_influencer(influencer_id: int, db: Session = Depends(get_db)):
    influencer = DatabaseService.get_influencer_by_id(db, influencer_id)
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return influencer

@router.put("/{influencer_id}", response_model=InfluencerResponse)
def update_influencer(influencer_id: int, data: InfluencerUpdate, db: Session = Depends(get_db)):
    updated = DatabaseService.update_influencer(db, influencer_id, data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return updated

@router.delete("/{influencer_id}")
def delete_influencer(influencer_id: int, db: Session = Depends(get_db)):
    success = DatabaseService.delete_influencer(db, influencer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Influencer not found")
    return {"message": f"Influencer #{influencer_id} deleted successfully."}

@router.post("/{influencer_id}/fetch")
async def trigger_fetch(influencer_id: int):
    result = await scheduler_service.trigger_influencer_update(influencer_id)
    return result
