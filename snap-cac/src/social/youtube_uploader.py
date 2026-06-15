"""
YouTube Shorts uploader — free, 6 uploads/day quota.
First run: opens browser for Google OAuth (one-time). Token saved to token.json.

Setup (one-time, 5 minutes):
  1. Go to console.cloud.google.com
  2. New project → Enable "YouTube Data API v3"
  3. Create credentials → OAuth 2.0 Client ID → Desktop App
  4. Download JSON → save as snap-cac/client_secrets.json
  5. Run: python -m src.social.youtube_uploader <video.mp4> "Title" "Description"
"""

import os
import sys
import json
import pickle
from pathlib import Path

SCOPES          = ["https://www.googleapis.com/auth/youtube.upload",
                   "https://www.googleapis.com/auth/youtube"]
TOKEN_FILE      = "youtube_token.pickle"
CLIENT_SECRETS  = "client_secrets.json"


def get_authenticated_service():
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            creds = pickle.load(f)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRETS):
                print("[YT] ERROR: client_secrets.json not found.")
                print("[YT] Steps:")
                print("  1. console.cloud.google.com → New project")
                print("  2. APIs & Services → Enable YouTube Data API v3")
                print("  3. Credentials → OAuth 2.0 Client ID → Desktop App")
                print("  4. Download JSON → save as client_secrets.json in snap-cac/")
                return None
            flow  = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(creds, f)

    return build("youtube", "v3", credentials=creds)


def upload_short(video_path: str, title: str, description: str,
                 tags: list = None, thumbnail_path: str = None) -> dict:
    from googleapiclient.http import MediaFileUpload

    youtube = get_authenticated_service()
    if not youtube:
        return {"success": False, "error": "Not authenticated"}

    tags = tags or ["realestate", "snaphomz", "mortgagerates", "homebuying", "shorts"]

    body = {
        "snippet": {
            "title":       title[:100],
            "description": description[:5000],
            "tags":        tags,
            "categoryId":  "22",  # People & Blogs
        },
        "status": {
            "privacyStatus":           "public",
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True,
                            mimetype="video/mp4")

    print(f"[YT] Uploading: {title}")
    request = youtube.videos().insert(part=",".join(body.keys()),
                                      body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"[YT] Upload progress: {int(status.progress() * 100)}%")

    video_id  = response.get("id", "")
    video_url = f"https://www.youtube.com/shorts/{video_id}"
    print(f"[YT] Done: {video_url}")

    # Set custom thumbnail (requires verified YouTube account)
    thumb = thumbnail_path or _default_thumbnail()
    if thumb and os.path.exists(thumb):
        try:
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(thumb, mimetype="image/jpeg"),
            ).execute()
            print(f"[YT] Thumbnail set: {thumb}")
        except Exception as e:
            print(f"[YT] Thumbnail skipped (account may need verification): {e}")

    return {"success": True, "video_id": video_id, "url": video_url,
            "thumbnail": thumb}


def _default_thumbnail() -> str:
    """Return output/thumbnail.jpg if it exists, else None."""
    p = os.path.join("output", "thumbnail.jpg")
    return p if os.path.exists(p) else None


def mock_upload(video_path: str, title: str, description: str,
                thumbnail_path: str = None) -> dict:
    """Simulate upload for demo without OAuth setup."""
    print(f"[YT] DEMO MODE — would upload: {video_path}")
    print(f"[YT] Title: {title}")
    print(f"[YT] Platform: YouTube Shorts")
    print(f"[YT] Status: queued (set up client_secrets.json to go live)")
    return {
        "success":   True,
        "simulated": True,
        "platform":  "YouTube Shorts",
        "title":     title,
        "note":      "Add client_secrets.json for real upload",
    }


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python -m src.social.youtube_uploader <video.mp4> <title> <description>")
        sys.exit(1)

    video_path  = sys.argv[1]
    title       = sys.argv[2]
    description = sys.argv[3]

    if os.path.exists(CLIENT_SECRETS):
        result = upload_short(video_path, title, description)
    else:
        result = mock_upload(video_path, title, description)

    print(json.dumps(result, indent=2))
