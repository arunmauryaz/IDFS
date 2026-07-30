import asyncio
import html
import random
import re
import time
import requests
from typing import Dict, Any, Optional
from app.core.base_scraper import BasePlatformScraper
from app.services.logging_service import logger, add_log_buffer

def clean_username(identifier: str) -> str:
    """Strips URLs, query params (?igsh=...), fragments, and '@' symbols to return raw username."""
    if not identifier:
        return ""
    s = identifier.strip().split("?")[0].split("#")[0].rstrip("/")
    return s.split("/")[-1].replace("@", "").strip()

def clean_avatar_url(url: Optional[str]) -> Optional[str]:
    """Unescapes HTML entities like &amp; in image URLs."""
    if not url:
        return None
    return html.unescape(url).replace("&amp;", "&").strip()

class InstagramScraper(BasePlatformScraper):
    @property
    def platform_name(self) -> str:
        return "instagram"

    async def fetch_profile(self, identifier: str) -> Dict[str, Any]:
        """
        Fetches an Instagram profile using real-time IG Web API, Playwright browser, or HTTP fallbacks.
        Extracts username, display name, avatar URL, follower count, post count, bio.
        """
        username = clean_username(identifier)
        start_time = time.time()
        add_log_buffer("INFO", "InstagramScraper", f"Initiating real-time profile fetch for @{username}")

        # Method 1: Primary Real-Time Instagram Web API (100% accurate, zero CDN cache delay)
        api_result = self._fetch_via_web_api(username, start_time)
        if api_result and api_result.get("status") == "success":
            add_log_buffer("INFO", "InstagramScraper", f"Live IG API fetch for @{username}: {api_result['follower_count']} followers")
            return api_result

        # Method 2: Playwright Async Browser Scraper
        try:
            profile_url = f"https://www.instagram.com/{username}/"
            from playwright.async_api import async_playwright
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--no-first-run",
                        "--no-zygote",
                        "--disable-gpu"
                    ]
                )
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                    viewport={"width": 1280, "height": 800},
                    extra_http_headers={
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache"
                    }
                )
                page = await context.new_page()

                response = await page.goto(profile_url, timeout=30000, wait_until="domcontentloaded")
                
                if response and response.status == 404:
                    await browser.close()
                    return {
                        "username": username,
                        "display_name": username,
                        "avatar_url": None,
                        "follower_count": 0,
                        "post_count": 0,
                        "bio": "",
                        "status": "error",
                        "error": "Profile not found (404)",
                        "is_live_api": False,
                        "duration_ms": int((time.time() - start_time) * 1000)
                    }

                content = await page.content()
                await browser.close()

                result = self._parse_html_meta(username, content)
                if result and result["follower_count"] > 0:
                    result["duration_ms"] = int((time.time() - start_time) * 1000)
                    result["is_live_api"] = False
                    add_log_buffer("INFO", "InstagramScraper", f"Scraped @{username} via Playwright (stale HTML fallback): {result['follower_count']} followers")
                    return result

        except Exception as e:
            logger.warning(f"Playwright fetch for @{username} failed: {str(e)}")

        # Method 3: Fallback parse
        return self._fetch_fallback(username, start_time)

    def _fetch_via_web_api(self, username: str, start_time: float) -> Optional[Dict[str, Any]]:
        """Queries Instagram's internal web_profile_info endpoint for real-time live stats."""
        app_ids = ["936619743392459", "1217981644879628", "255375533314545"]
        for app_id in app_ids:
            try:
                url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                    "x-ig-app-id": app_id,
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Referer": f"https://www.instagram.com/{username}/"
                }
                res = requests.get(url, headers=headers, timeout=8)
                if res.status_code == 200:
                    data = res.json()
                    user = data.get("data", {}).get("user")
                    if user:
                        followers = user.get("edge_followed_by", {}).get("count", 0)
                        posts = user.get("edge_owner_to_timeline_media", {}).get("count", 0)
                        display_name = user.get("full_name") or username
                        raw_avatar = user.get("profile_pic_url_hd") or user.get("profile_pic_url")
                        avatar_url = clean_avatar_url(raw_avatar)
                        bio = user.get("biography", "")

                        return {
                            "username": username,
                            "display_name": display_name,
                            "avatar_url": avatar_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={username}",
                            "follower_count": followers,
                            "post_count": posts,
                            "bio": bio,
                            "status": "success",
                            "error": None,
                            "is_live_api": True,
                            "duration_ms": int((time.time() - start_time) * 1000)
                        }
            except Exception as err:
                logger.warning(f"Web API fetch with app_id {app_id} failed for @{username}: {err}")

        return None

    def _parse_html_meta(self, username: str, html_str: str) -> Optional[Dict[str, Any]]:
        """Parses OpenGraph meta tags or meta description from Instagram HTML."""
        try:
            meta_match = re.search(r'<meta content="([^"]* Followers[^"]*)" name="description"', html_str, re.IGNORECASE)
            if not meta_match:
                meta_match = re.search(r'property="og:description" content="([^"]*)"', html_str, re.IGNORECASE)
            
            followers, posts = 0, 0
            if meta_match:
                content = meta_match.group(1)
                f_match = re.search(r'([\d,\.KMBkm]+)\s*Followers', content)
                if f_match:
                    followers = self._parse_number(f_match.group(1))
                p_match = re.search(r'([\d,\.KMBkm]+)\s*Posts', content)
                if p_match:
                    posts = self._parse_number(p_match.group(1))

            avatar_match = re.search(r'property="og:image" content="([^"]*)"', html_str)
            raw_avatar = avatar_match.group(1) if avatar_match else None
            avatar_url = clean_avatar_url(raw_avatar) or f"https://api.dicebear.com/7.x/identicon/svg?seed={username}"

            title_match = re.search(r'<title>([^<]*)</title>', html_str)
            display_name = username
            if title_match:
                raw_title = title_match.group(1)
                display_name = raw_title.split("(@")[0].strip() or username

            if followers > 0:
                return {
                    "username": username,
                    "display_name": display_name,
                    "avatar_url": avatar_url,
                    "follower_count": followers,
                    "post_count": posts,
                    "bio": f"Instagram profile for @{username}",
                    "status": "success",
                    "error": None,
                    "is_live_api": False
                }
        except Exception as parse_err:
            logger.error(f"HTML meta parse error for @{username}: {parse_err}")

        return None

    def _fetch_fallback(self, username: str, start_time: float) -> Dict[str, Any]:
        """Fallback parse."""
        return {
            "username": username,
            "display_name": username.replace("_", " ").replace(".", " ").title(),
            "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            "follower_count": 0,
            "post_count": 0,
            "bio": f"Instagram profile for @{username}",
            "status": "error",
            "error": "Live stats fetch temporary rate limit",
            "is_live_api": False,
            "duration_ms": int((time.time() - start_time) * 1000)
        }

    def _parse_number(self, text: str) -> int:
        clean = text.replace(",", "").strip().upper()
        if "K" in clean:
            return int(float(clean.replace("K", "")) * 1000)
        if "M" in clean:
            return int(float(clean.replace("M", "")) * 1000000)
        if "B" in clean:
            return int(float(clean.replace("B", "")) * 1000000000)
        return int(float(clean))

class ScraperService:
    def __init__(self):
        self.scrapers: Dict[str, BasePlatformScraper] = {
            "instagram": InstagramScraper()
        }

    def register_scraper(self, scraper: BasePlatformScraper):
        self.scrapers[scraper.platform_name.lower()] = scraper

    async def fetch_influencer(self, platform: str, identifier: str) -> Dict[str, Any]:
        platform_key = platform.lower()
        if platform_key not in self.scrapers:
            return {
                "username": identifier,
                "display_name": identifier,
                "avatar_url": None,
                "follower_count": 0,
                "post_count": 0,
                "bio": "",
                "status": "error",
                "error": f"Platform '{platform}' is not currently supported.",
                "duration_ms": 0
            }
        
        return await self.scrapers[platform_key].fetch_profile(identifier)

scraper_service = ScraperService()
