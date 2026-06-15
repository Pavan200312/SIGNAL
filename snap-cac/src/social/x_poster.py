"""
Twitter/X poster — free tier (1,500 tweets/month).
Posts up to 4 slide images + caption text as a tweet.

Setup (5 minutes):
  1. Go to developer.twitter.com → Create app (free)
  2. Generate: API Key, API Secret, Access Token, Access Token Secret
  3. Add to .env:
       X_API_KEY=...
       X_API_SECRET=...
       X_ACCESS_TOKEN=...
       X_ACCESS_SECRET=...
  4. Run: python main.py auto rate_alert 10001
"""

import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

X_API_KEY      = os.getenv("X_API_KEY", "")
X_API_SECRET   = os.getenv("X_API_SECRET", "")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN", "")
X_ACCESS_SECRET= os.getenv("X_ACCESS_SECRET", "")


def post_to_x(caption: str, slide_images: list, title: str = "") -> dict:
    """Post tweet with up to 4 slide images."""

    if not all([X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET]):
        return mock_post_x(caption, slide_images)

    try:
        import tweepy

        # v1.1 for media upload, v2 for tweet
        auth = tweepy.OAuth1UserHandler(
            X_API_KEY, X_API_SECRET,
            X_ACCESS_TOKEN, X_ACCESS_SECRET
        )
        api_v1 = tweepy.API(auth)
        client  = tweepy.Client(
            consumer_key=X_API_KEY,
            consumer_secret=X_API_SECRET,
            access_token=X_ACCESS_TOKEN,
            access_token_secret=X_ACCESS_SECRET,
        )

        # Upload up to 4 images (X limit)
        media_ids = []
        for img_path in slide_images[:4]:
            if os.path.exists(img_path):
                media    = api_v1.media_upload(filename=img_path)
                media_ids.append(str(media.media_id))

        # Trim caption to 280 chars
        tweet_text = caption[:270] + " snaphomz.com" if len(caption) > 270 else caption

        if media_ids:
            resp = client.create_tweet(text=tweet_text, media_ids=media_ids)
        else:
            resp = client.create_tweet(text=tweet_text)

        tweet_id  = resp.data["id"]
        tweet_url = f"https://x.com/i/status/{tweet_id}"
        print(f"[X] Posted: {tweet_url}")
        return {"success": True, "url": tweet_url, "tweet_id": tweet_id}

    except Exception as e:
        import traceback
        err = str(e)
        print(f"[X] Error: {err}")
        if "402" in err or "credits" in err.lower() or "Payment" in err:
            print("[X] X API requires paid plan to post. Using demo mode.")
            return mock_post_x(caption, slide_images)
        print(f"[X] Detail: {traceback.format_exc()}")
        return {"success": False, "error": err}


def mock_post_x(caption: str, slide_images: list) -> dict:
    print("[X] DEMO MODE — would post to X/Twitter:")
    print(f"[X] Caption: {caption[:100]}...")
    print(f"[X] Images:  {len(slide_images)} slides attached")
    print("[X] Upgrade to X API Basic ($100/mo) at developer.twitter.com to go live")
    return {
        "success":   True,
        "simulated": True,
        "platform":  "X/Twitter",
        "url":       "https://x.com/PavanSai31089",
        "note":      "Demo mode — upgrade X API plan to post live",
    }
