"""
Reddit trend scraper for SnapCAC — news and topic source.
Pulls hot/top/rising posts from real estate subreddits.
Public JSON endpoints, no auth required for prototype.
"""

import json
import time
import urllib.request
from datetime import datetime, timezone
from typing import Optional

# Subreddits grouped by audience
SUBREDDIT_MAP = {
    "buyer":    ["FirstTimeHomeBuyer", "FirstTimeHomeBuyers", "homebuying", "personalfinance"],
    "seller":   ["RealEstate", "realtors"],
    "investor": ["realestateinvesting", "RealEstate"],
    "agent":    ["realtors", "RealEstate"],
    "all":      ["RealEstate", "FirstTimeHomeBuyer", "homebuying",
                 "realestateinvesting", "realtors"],
}

HEADERS = {"User-Agent": "SnapCACTrendResearch/1.0 by Snaphomz"}
LIMIT   = 10


def _fetch_reddit_json(subreddit: str, sort: str = "hot",
                       time_filter: Optional[str] = None) -> list:
    url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={LIMIT}"
    if sort == "top" and time_filter:
        url += f"&t={time_filter}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        return data.get("data", {}).get("children", [])
    except Exception:
        return []


def _marketing_angle(title: str, subreddit: str) -> str:
    lo = title.lower()
    if any(w in lo for w in ["rate", "mortgage", "interest", "apr"]):
        return "Mortgage rate / affordability"
    if any(w in lo for w in ["inspection", "repair", "foundation", "roof", "mold"]):
        return "Inspection fear / hidden risk"
    if any(w in lo for w in ["offer", "bid", "accepted", "waive", "contingency"]):
        return "Offer strategy / competition"
    if any(w in lo for w in ["first", "first-time"]):
        return "First-time buyer education"
    if any(w in lo for w in ["rent", "landlord", "tenant"]):
        return "Rent vs buy"
    if any(w in lo for w in ["seller", "listing", "list price", "price drop"]):
        return "Seller pricing strategy"
    if any(w in lo for w in ["invest", "cashflow", "cash flow", "rental", "cap rate"]):
        return "Investment / cashflow"
    if any(w in lo for w in ["school", "district", "neighborhood"]):
        return "Location / school intel"
    return "General real estate trend"


def _map_angle_to_content_type(angle: str) -> str:
    mapping = {
        "Mortgage rate / affordability":  "rate_alert",
        "Inspection fear / hidden risk":  "buyer_pain",
        "Offer strategy / competition":   "buyer_tip",
        "First-time buyer education":     "buyer_tip",
        "Rent vs buy":                    "affordability",
        "Seller pricing strategy":        "seller_alert",
        "Investment / cashflow":          "investment_tip",
        "Location / school intel":        "school_spotlight",
        "General real estate trend":      "market_pulse",
    }
    return mapping.get(angle, "market_pulse")


def get_trending_topics(audience: str = "all", limit: int = 5) -> list:
    """
    Returns top trending Reddit posts for a given audience.
    Each item: { title, subreddit, score, comments, angle,
                 content_type, permalink, scraped_at }
    """
    subreddits = SUBREDDIT_MAP.get(audience, SUBREDDIT_MAP["all"])
    posts = []
    seen  = set()

    for sub in subreddits:
        for sort, tf in [("hot", None), ("top", "week"), ("rising", None)]:
            children = _fetch_reddit_json(sub, sort, tf)
            for child in children:
                d    = child.get("data", {})
                link = d.get("permalink", "")
                if not link or link in seen:
                    continue
                seen.add(link)
                title = d.get("title", "").strip()
                angle = _marketing_angle(title, sub)
                posts.append({
                    "title":        title,
                    "subreddit":    sub,
                    "score":        d.get("score", 0),
                    "comments":     d.get("num_comments", 0),
                    "angle":        angle,
                    "content_type": _map_angle_to_content_type(angle),
                    "permalink":    f"https://www.reddit.com{link}",
                    "selftext":     d.get("selftext", "")[:300],
                    "scraped_at":   datetime.now(timezone.utc).isoformat(),
                })
            time.sleep(0.5)

    # Rank by engagement: score + comments * 2
    posts.sort(key=lambda p: p["score"] + p["comments"] * 2, reverse=True)
    return posts[:limit]


def get_top_topic(audience: str = "all") -> dict:
    """Returns single highest-engagement post for use in script generation."""
    topics = get_trending_topics(audience, limit=1)
    return topics[0] if topics else {}
