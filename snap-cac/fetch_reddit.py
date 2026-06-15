"""
Fetch Reddit real estate posts via Brave Search API.
Reddit direct JSON API is blocked since 2023.
Brave Search indexes all public Reddit posts — same data, no OAuth needed.

Usage:
  python fetch_reddit.py                         # fetch all audiences
  python fetch_reddit.py buyer                   # fetch buyer posts only
  python fetch_reddit.py seller                  # fetch seller posts only
  python fetch_reddit.py agent                   # fetch agent posts only

Requires: BRAVE_SEARCH_API_KEY in environment or hardcoded below.
"""

import sys
import json
import os
import urllib.request
import urllib.parse
import time

BRAVE_KEY = os.getenv("BRAVE_SEARCH_API_KEY", "BSArE1orEtlnJrDRSUztoCgZbgdSfIG")
BRAVE_URL = "https://api.search.brave.com/res/v1/web/search"

QUERIES = {
    "buyer": [
        "site:reddit.com r/FirstTimeHomeBuyer buying home problems 2026",
        "site:reddit.com r/RealEstate first time buyer advice mortgage 2026",
        "site:reddit.com r/Mortgages home loan rates affordability 2026",
        "site:reddit.com r/RealEstate bidding war offer rejected 2026",
        "site:reddit.com r/RealEstate how much house can I afford 2026",
    ],
    "seller": [
        "site:reddit.com r/RealEstate selling home pricing strategy 2026",
        "site:reddit.com r/RealEstate sellers pulling listing off market 2026",
        "site:reddit.com r/RealEstate best time to sell house 2026",
        "site:reddit.com r/homeowners selling home advice 2026",
        "site:reddit.com r/RealEstate price reduction days on market 2026",
    ],
    "agent": [
        "site:reddit.com r/RealEstateAgent commission NAR settlement 2026",
        "site:reddit.com r/realestateinvesting investment property tips 2026",
        "site:reddit.com r/RealEstate realtor buyer agreement 2026",
        "site:reddit.com r/RealEstateAgent lead generation clients 2026",
    ],
    "general": [
        "site:reddit.com r/RealEstate housing market USA hot 2026",
        "site:reddit.com r/HousingMarket inventory prices 2026",
        "site:reddit.com r/RealEstate real estate news trending 2026",
    ],
}


def brave_search(query: str, count: int = 8) -> list:
    params = urllib.parse.urlencode({"q": query, "count": count, "freshness": "pw"})
    url = f"{BRAVE_URL}?{params}"
    req = urllib.request.Request(url, headers={"X-Subscription-Token": BRAVE_KEY})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        results = data.get("web", {}).get("results", [])
        return [
            {
                "title":       r.get("title", ""),
                "description": r.get("description", ""),
                "url":         r.get("url", ""),
                "age":         r.get("age", ""),
                "source":      r.get("meta_url", {}).get("hostname", "reddit.com"),
            }
            for r in results
            if "reddit.com" in r.get("url", "")
        ]
    except Exception as e:
        print(f"  [ERROR] Brave search failed: {e}", file=sys.stderr)
        return []


def fetch_audience(audience: str) -> list:
    queries = QUERIES.get(audience, [])
    posts = []
    seen = set()
    for q in queries:
        results = brave_search(q, 8)
        for r in results:
            if r["url"] not in seen:
                seen.add(r["url"])
                posts.append({**r, "audience": audience})
        time.sleep(0.35)
    return posts


def fetch_all() -> dict:
    all_posts = []
    by_audience = {}
    for audience in QUERIES:
        posts = fetch_audience(audience)
        by_audience[audience] = posts
        all_posts.extend(posts)
        print(f"  [{audience}]: {len(posts)} posts", file=sys.stderr)

    return {
        "total": len(all_posts),
        "posts": all_posts,
        "by_audience": by_audience,
    }


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None

    if target and target in QUERIES:
        print(f"Fetching {target} Reddit posts via Brave Search...", file=sys.stderr)
        posts = fetch_audience(target)
        result = {"audience": target, "total": len(posts), "posts": posts}
    else:
        print("Fetching all Reddit posts via Brave Search...", file=sys.stderr)
        result = fetch_all()

    print(json.dumps(result, indent=2))
