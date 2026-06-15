import requests
import json
import os
from datetime import datetime


class PostBridgePublisher:
    BASE_URL = "https://api.post-bridge.com/v1"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def get_accounts(self) -> list:
        try:
            resp = requests.get(f"{self.BASE_URL}/social-accounts", headers=self.headers, timeout=10)
            if resp.status_code == 200:
                return resp.json().get("accounts", [])
        except Exception as e:
            print(f"  [PostBridge] Could not fetch accounts: {e}")
        return []

    def post_content(self, caption: str, video_path: str = None, image_path: str = None) -> dict:
        accounts = self.get_accounts()
        if not accounts:
            return {"success": False, "error": "No connected social accounts", "simulated": True}

        try:
            payload = {
                "caption": caption,
                "account_ids": [a["id"] for a in accounts],
                "scheduled_at": None
            }
            if video_path:
                payload["media_type"] = "video"
                payload["media_url"] = video_path
            elif image_path:
                payload["media_type"] = "image"
                payload["media_url"] = image_path

            resp = requests.post(f"{self.BASE_URL}/posts", headers=self.headers, json=payload, timeout=15)
            return {"success": resp.status_code == 200, "data": resp.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}


class MockPublisher:
    """Used when no PostBridge key — simulates posting for demo."""

    def post_content(self, caption: str, content_data: dict, platform: str = "all") -> dict:
        platforms = ["TikTok", "Instagram Reels", "YouTube Shorts"]
        results = []
        for p in platforms:
            results.append({
                "platform": p,
                "status": "queued",
                "post_id": f"mock_{p.lower().replace(' ', '_')}_{datetime.now().strftime('%H%M%S')}",
                "estimated_reach": {"TikTok": "2,000-15,000", "Instagram Reels": "800-5,000", "YouTube Shorts": "500-3,000"}.get(p, "1,000+"),
                "scheduled_at": datetime.now().strftime("%Y-%m-%d %H:%M")
            })

        return {
            "success": True,
            "simulated": True,
            "posted_to": results,
            "caption_preview": caption[:100] + "..." if len(caption) > 100 else caption
        }
