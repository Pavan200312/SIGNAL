import os
import json
import random
import urllib.request
import urllib.parse
import requests
from datetime import datetime

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

FRED_BASE  = "https://api.stlouisfed.org/fred/series/observations"
BRAVE_URL  = "https://api.search.brave.com/res/v1/web/search"
BRAVE_KEY  = os.getenv("BRAVE_SEARCH_API_KEY", "BSArE1orEtlnJrDRSUztoCgZbgdSfIG")
FRED_KEY   = os.getenv("FRED_API_KEY", "0a78da40df4f6efbc7f2923fa4f7e5cc")
RAPID_KEY  = os.getenv("RAPIDAPI_KEY", "")
RAPID_HOST = os.getenv("RAPIDAPI_HOST", "private-zillow.p.rapidapi.com")

CONTENT_TEMPLATES = {
    # FRED-based
    "rate_alert": {
        "hook": "Mortgage rates just moved -- here's what it means for YOU",
        "cta":  "Use Snaphomz to find homes in your new budget at snaphomz.com",
        "source": "fred",
    },
    # Brave News-based
    "news_flash": {
        "hook": "This real estate news just dropped and most buyers have no idea",
        "cta":  "Stay ahead of the market at snaphomz.com",
        "source": "news",
    },
    "seller_alert": {
        "hook": "Sellers -- the market just shifted. Here is what you need to know",
        "cta":  "Price your home right with Snaphomz at snaphomz.com",
        "source": "news",
    },
    # Zillow/market-based
    "market_update": {
        "hook": "Here is what is happening in the US housing market RIGHT NOW",
        "cta":  "Search smarter on Snaphomz at snaphomz.com",
        "source": "market",
    },
    "hot_market": {
        "hook": "This ZIP code is on fire -- homes selling in under 2 weeks",
        "cta":  "Find homes before they are gone at snaphomz.com",
        "source": "market",
    },
    # Pure Groq (no external data needed)
    "buyer_tip": {
        "hook": "First-time buyer? Most people do not know this trick",
        "cta":  "Start your search on Snaphomz -- it is free at snaphomz.com",
        "source": "ai",
    },
    "investment_tip": {
        "hook": "Real estate investors are doing this right now to beat the market",
        "cta":  "Find investment properties on Snaphomz at snaphomz.com",
        "source": "ai",
    },
    "affordability": {
        "hook": "Can you actually afford a home right now? The math might surprise you",
        "cta":  "Run your numbers free at snaphomz.com",
        "source": "ai",
    },
    # SnapGrad school data
    "school_spotlight": {
        "hook": "Buying a home? The school district matters MORE than you think",
        "cta":  "Check school ratings for any address on Snaphomz at snaphomz.com",
        "source": "school",
    },
    # Premium 5-scene templates (new spec)
    "market_pulse": {
        "hook": "Buyers are waiting. Here is what the market is actually doing.",
        "cta":  "Comment your city for a market breakdown.",
        "source": "market",
    },
    "buyer_pain": {
        "hook": "Home buying feels confusing. Here is what most buyers miss.",
        "cta":  "Follow for smarter home-buying decisions.",
        "source": "fred",
    },
    "listing_breakdown": {
        "hook": "This home looks simple. The numbers tell a different story.",
        "cta":  "Would you offer above or below asking?",
        "source": "market",
    },
    "agent_insight": {
        "hook": "Agents should watch this. The market is shifting fast.",
        "cta":  "Share this with a buyer or seller.",
        "source": "market",
    },
    "myth_reality": {
        "hook": "Lower price is not always better. Here is the real math.",
        "cta":  "Save this before touring homes.",
        "source": "ai",
    },
}


# ─────────────────────────────────────────
# FRED — mortgage rates
# ─────────────────────────────────────────
def get_mortgage_rate() -> dict:
    try:
        params = {
            "series_id": "MORTGAGE30US",
            "api_key":   FRED_KEY,
            "file_type": "json",
            "limit":     2,
            "sort_order": "desc",
        }
        resp = requests.get(FRED_BASE, params=params, timeout=5)
        if resp.status_code == 200:
            obs = resp.json().get("observations", [])
            if len(obs) >= 2:
                current  = float(obs[0]["value"])
                previous = float(obs[1]["value"])
                change   = round(current - previous, 2)
                return {
                    "rate":      current,
                    "previous":  previous,
                    "change":    change,
                    "direction": "up" if change > 0 else "down",
                    "date":      obs[0]["date"],
                }
    except Exception:
        pass
    return {"rate": 6.82, "previous": 6.95, "change": -0.13, "direction": "down",
            "date": datetime.now().strftime("%Y-%m-%d")}


# ─────────────────────────────────────────
# Brave Search — live news
# ─────────────────────────────────────────
def get_real_estate_news(audience: str = "buyer") -> dict:
    queries = {
        "buyer":   "US real estate housing market news buyers 2026",
        "seller":  "home sellers housing market USA news 2026",
        "general": "US real estate market trends news today 2026",
        "invest":  "real estate investment opportunity USA 2026",
    }
    query = queries.get(audience, queries["general"])
    try:
        params  = urllib.parse.urlencode({"q": query, "count": 5, "freshness": "pd"})
        url     = f"{BRAVE_URL}?{params}"
        req     = urllib.request.Request(url, headers={"X-Subscription-Token": BRAVE_KEY,
                                                        "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data    = json.loads(r.read().decode("utf-8"))
        results = data.get("web", {}).get("results", [])
        articles = [
            {"title": r.get("title", ""), "description": r.get("description", ""), "url": r.get("url", "")}
            for r in results[:3]
        ]
        return {"articles": articles, "query": query, "audience": audience}
    except Exception as e:
        return {
            "articles": [
                {"title": "Housing market sees continued demand in 2026",
                 "description": "Inventory remains tight as buyer competition increases across major metros.",
                 "url": ""},
                {"title": "Mortgage rates hold steady as Fed signals patience",
                 "description": "Buyers seeing window of opportunity with stable rates below 7%.",
                 "url": ""},
            ],
            "query": query,
            "audience": audience,
            "error": str(e),
        }


# ─────────────────────────────────────────
# Market snapshot — Zillow RapidAPI or mock
# ─────────────────────────────────────────
MOCK_MARKETS = {
    "90210": {"city": "Beverly Hills",  "median_price": 2850000, "inventory": 45,  "days_on_market": 28, "yoy_change": 3.2},
    "10001": {"city": "New York",       "median_price": 1250000, "inventory": 312, "days_on_market": 45, "yoy_change": 1.8},
    "60601": {"city": "Chicago",        "median_price": 485000,  "inventory": 189, "days_on_market": 22, "yoy_change": 5.1},
    "77001": {"city": "Houston",        "median_price": 325000,  "inventory": 420, "days_on_market": 31, "yoy_change": 2.9},
    "85001": {"city": "Phoenix",        "median_price": 415000,  "inventory": 265, "days_on_market": 18, "yoy_change": 7.3},
    "33101": {"city": "Miami",          "median_price": 620000,  "inventory": 178, "days_on_market": 35, "yoy_change": 4.5},
    "98101": {"city": "Seattle",        "median_price": 875000,  "inventory": 134, "days_on_market": 14, "yoy_change": 6.2},
    "30301": {"city": "Atlanta",        "median_price": 395000,  "inventory": 298, "days_on_market": 25, "yoy_change": 8.1},
    "78201": {"city": "San Antonio",    "median_price": 285000,  "inventory": 510, "days_on_market": 38, "yoy_change": 1.4},
    "92101": {"city": "San Diego",      "median_price": 920000,  "inventory": 98,  "days_on_market": 12, "yoy_change": 9.1},
    "19101": {"city": "Philadelphia",   "median_price": 340000,  "inventory": 231, "days_on_market": 19, "yoy_change": 6.7},
    "75201": {"city": "Dallas",         "median_price": 445000,  "inventory": 387, "days_on_market": 26, "yoy_change": 3.8},
}


def get_market_snapshot(zip_code: str = "10001") -> dict:
    if RAPID_KEY:
        try:
            url  = f"https://{RAPID_HOST}/byaddress"
            headers = {
                "X-RapidAPI-Key":  RAPID_KEY,
                "X-RapidAPI-Host": RAPID_HOST,
            }
            resp = requests.get(url, headers=headers,
                                params={"zip": zip_code}, timeout=6)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("median_price"):
                    return {
                        "city":            d.get("city", zip_code),
                        "median_price":    d.get("median_price", 400000),
                        "inventory":       d.get("total_homes", 100),
                        "days_on_market":  d.get("days_on_market", 30),
                        "yoy_change":      d.get("yoy_price_change", 3.0),
                    }
        except Exception:
            pass
    return MOCK_MARKETS.get(zip_code, MOCK_MARKETS["10001"])


# ─────────────────────────────────────────
# School data (SnapGrad mock)
# ─────────────────────────────────────────
def get_school_data(zip_code: str = "90210") -> dict:
    return {
        "zip":               zip_code,
        "top_school":        "Lincoln Elementary",
        "rating":            9.2,
        "district":          "Beverly Hills USD",
        "college_readiness": 94,
        "avg_rating_nearby": 8.7,
    }


# ─────────────────────────────────────────
# Buyer tips (pure Groq — no external data)
# ─────────────────────────────────────────
BUYER_TIPS = [
    {"tip": "Get pre-approved BEFORE house hunting. Sellers take you 3x more seriously.",
     "savings": "Saves avg $8,000 in negotiation"},
    {"tip": "A 1% rate difference on a $400k loan = $240/month. Always shop 3+ lenders.",
     "savings": "$86,000 over 30 years"},
    {"tip": "Request seller concessions instead of price cut. Often easier to get.",
     "savings": "Up to $12,000 in closing costs"},
    {"tip": "Never skip the home inspection. Avg cost $400. Avg problem found: $4,000.",
     "savings": "10x ROI guaranteed"},
    {"tip": "Buy in Q4 (Oct-Dec). Least competition, most motivated sellers.",
     "savings": "$15,000-25,000 on average home"},
    {"tip": "15-year mortgage saves $100k+ in interest vs 30-year on a $400k loan.",
     "savings": "$100,000+ over loan life"},
    {"tip": "FHA loans let you buy with just 3.5% down. Most buyers don't know this.",
     "savings": "$20,000+ kept in pocket"},
]

def get_buyer_tip() -> dict:
    return random.choice(BUYER_TIPS)


# ─────────────────────────────────────────
# Master fetch — routes by content type
# ─────────────────────────────────────────
def fetch_all_data(zip_code: str = "10001", content_type: str = None) -> dict:
    rate_data   = get_mortgage_rate()
    market_data = get_market_snapshot(zip_code)
    school_data = get_school_data(zip_code)
    tip_data    = get_buyer_tip()

    # Brave Search news — only for news-type content
    news_data = None
    if content_type in ("news_flash", "seller_alert"):
        audience  = "seller" if content_type == "seller_alert" else "buyer"
        news_data = get_real_estate_news(audience)

    return {
        "rates":      rate_data,
        "market":     market_data,
        "schools":    school_data,
        "tip":        tip_data,
        "news":       news_data,
        "zip":        zip_code,
        "fetched_at": datetime.now().isoformat(),
    }
