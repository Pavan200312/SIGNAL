import json
import os
from datetime import datetime, timedelta
from prettytable import PrettyTable


METRICS_FILE = "metrics.json"


def load_metrics() -> dict:
    if os.path.exists(METRICS_FILE):
        with open(METRICS_FILE, "r") as f:
            return json.load(f)
    return {
        "posts": [],
        "total_views": 0,
        "total_clicks": 0,
        "total_signups": 0,
        "total_ad_spend": 0,
        "organic_signups": 0,
        "sessions": []
    }


def save_metrics(metrics: dict):
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2)


def log_post(content_type: str, title: str, platforms: list):
    metrics = load_metrics()
    post = {
        "id": len(metrics["posts"]) + 1,
        "type": content_type,
        "title": title,
        "platforms": platforms,
        "posted_at": datetime.now().isoformat(),
        "views": 0,
        "clicks": 0,
        "signups": 0
    }
    metrics["posts"].append(post)
    save_metrics(metrics)
    return post


def simulate_engagement(post_id: int):
    """Simulate realistic engagement for demo purposes."""
    import random
    metrics = load_metrics()
    for post in metrics["posts"]:
        if post["id"] == post_id:
            post["views"] = random.randint(1200, 18000)
            post["clicks"] = int(post["views"] * random.uniform(0.02, 0.08))
            post["signups"] = int(post["clicks"] * random.uniform(0.05, 0.15))
            metrics["total_views"] += post["views"]
            metrics["total_clicks"] += post["clicks"]
            metrics["total_signups"] += post["signups"]
            metrics["organic_signups"] += post["signups"]
            break
    save_metrics(metrics)
    return metrics


def calculate_cac(metrics: dict, cost_per_paid_signup: float = 300.0) -> dict:
    organic = metrics.get("organic_signups", 0)
    paid = metrics.get("total_ad_spend", 0)

    organic_cac = 0 if organic == 0 else round((paid * 0) / max(organic, 1), 2)
    blended_cac = round(paid / max(organic + 1, 1), 2)

    return {
        "organic_signups": organic,
        "organic_cac": organic_cac,
        "traditional_cac": cost_per_paid_signup,
        "savings_per_user": cost_per_paid_signup - organic_cac,
        "total_savings": round((cost_per_paid_signup - organic_cac) * organic, 2),
        "roi_multiplier": round(cost_per_paid_signup / max(organic_cac, 1), 1) if organic_cac > 0 else "∞"
    }


def display_dashboard(metrics: dict = None):
    if metrics is None:
        metrics = load_metrics()

    # Inject demo data if empty (for hackathon demo)
    if metrics["total_views"] == 0:
        metrics = {
            "posts": [
                {"id": 1, "type": "rate_alert", "title": "Rates Dropped — What It Means For You", "platforms": ["TikTok", "Instagram", "YouTube"], "views": 14200, "clicks": 847, "signups": 94},
                {"id": 2, "type": "market_update", "title": "NYC Housing Market Update", "platforms": ["TikTok", "Instagram", "YouTube"], "views": 8900, "clicks": 412, "signups": 51},
                {"id": 3, "type": "buyer_tip", "title": "This Trick Saves Buyers $8,000", "platforms": ["TikTok", "Instagram", "YouTube"], "views": 22100, "clicks": 1340, "signups": 178},
                {"id": 4, "type": "school_spotlight", "title": "School Ratings Change Home Values 25%", "platforms": ["TikTok", "Instagram", "YouTube"], "views": 6700, "clicks": 298, "signups": 37},
            ],
            "total_views": 51900,
            "total_clicks": 2897,
            "total_signups": 360,
            "total_ad_spend": 0,
            "organic_signups": 360
        }

    cac = calculate_cac(metrics)

    print("\n" + "="*60)
    print("  SNAPCAC DASHBOARD - Customer Acquisition Analytics")
    print("="*60)

    # Summary metrics
    summary = PrettyTable()
    summary.field_names = ["Metric", "Value"]
    summary.align["Metric"] = "l"
    summary.align["Value"] = "r"
    summary.add_row(["Total Posts Published", len(metrics["posts"])])
    summary.add_row(["Total Views (Organic)", f"{metrics['total_views']:,}"])
    summary.add_row(["Total Clicks to Snaphomz", f"{metrics['total_clicks']:,}"])
    summary.add_row(["Total New Signups", f"{metrics['total_signups']:,}"])
    summary.add_row(["Ad Spend", f"${metrics['total_ad_spend']:,}"])
    print(summary)

    # CAC comparison
    print("\n  CAC REDUCTION ANALYSIS")
    cac_table = PrettyTable()
    cac_table.field_names = ["Channel", "CAC", "Signups", "Total Cost"]
    cac_table.align = "r"
    cac_table.align["Channel"] = "l"
    cac_table.add_row(["Paid Ads (before)", f"${cac['traditional_cac']:,.0f}", "—", f"${cac['traditional_cac'] * cac['organic_signups']:,.0f} (projected)"])
    cac_table.add_row(["SnapCAC Organic", "$0", f"{cac['organic_signups']:,}", "$0"])
    cac_table.add_row(["Savings per User", f"${cac['savings_per_user']:,.0f}", "—", f"${cac['total_savings']:,.0f} SAVED"])
    print(cac_table)

    # Per-post performance
    print("\n  POST PERFORMANCE")
    post_table = PrettyTable()
    post_table.field_names = ["#", "Type", "Views", "Clicks", "Signups", "CTR"]
    post_table.align["Type"] = "l"
    for p in metrics["posts"][:5]:
        ctr = f"{(p['clicks']/max(p['views'],1)*100):.1f}%" if p['views'] > 0 else "—"
        post_table.add_row([p["id"], p["type"], f"{p['views']:,}", f"{p['clicks']:,}", p["signups"], ctr])
    print(post_table)

    print(f"\n  BOTTOM LINE: {cac['organic_signups']} users acquired at $0 CAC")
    print(f"  vs ${cac['traditional_cac']}/user paid = ${cac['total_savings']:,.0f} saved\n")
