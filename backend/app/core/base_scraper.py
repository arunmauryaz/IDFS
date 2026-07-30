from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePlatformScraper(ABC):
    """
    Abstract base class for all social platform scrapers.
    Ensures easy extensibility for YouTube, TikTok, X, LinkedIn, etc.
    """
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Returns platform identifier (e.g. 'instagram', 'youtube', 'tiktok')."""
        pass

    @abstractmethod
    async def fetch_profile(self, identifier: str) -> Dict[str, Any]:
        """
        Fetch profile data given username or URL.
        Must return dict containing:
        - username: str
        - display_name: str
        - avatar_url: str
        - follower_count: int
        - post_count: Optional[int]
        - bio: Optional[str]
        - status: str ('success', 'error', 'rate_limited')
        - error: Optional[str]
        """
        pass
