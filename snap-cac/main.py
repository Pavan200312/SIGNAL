import os
import sys
import json
import time
import schedule
from dotenv import load_dotenv
from termcolor import colored
from pyfiglet import figlet_format
from datetime import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

from src.data.fetcher import fetch_all_data, CONTENT_TEMPLATES
from src.content.generator import generate_script
from src.social.publisher import MockPublisher, PostBridgePublisher
from src.dashboard.tracker import display_dashboard, log_post, simulate_engagement


def load_config() -> dict:
    """Load config.json for non-secret settings; secrets come from .env."""
    config_file = "config.json"
    if not os.path.exists(config_file):
        example = "config.example.json"
        if os.path.exists(example):
            with open(example) as f:
                return json.load(f)
        return {}
    with open(config_file) as f:
        cfg = json.load(f)
    # Env vars override config.json secrets
    env_map = {
        "anthropic_api_key": "ANTHROPIC_API_KEY",
        "groq_api_key":      "GROQ_API_KEY",
        "fred_api_key":      "FRED_API_KEY",
        "pexels_api_key":    "PEXELS_API_KEY",
        "ayrshare_api_key":  "AYRSHARE_API_KEY",
        "rapidapi_key":      "RAPIDAPI_KEY",
        "brave_api_key":     "BRAVE_SEARCH_API_KEY",
        "vapi_api_key":      "VAPI_API_KEY",
    }
    for cfg_key, env_key in env_map.items():
        val = os.getenv(env_key)
        if val:
            cfg[cfg_key] = val
    return cfg


def print_header():
    print(colored(figlet_format("SnapCAC", font="slant"), "cyan"))
    print(colored("  Automated Real Estate Content Engine — Reduce CAC to $0", "white"))
    print(colored("  Powered by Snaphomz Data + AI\n", "yellow"))


def print_step(step: str, msg: str):
    icons = {"fetch": "[FETCH]", "generate": "[GEN]  ", "post": "[POST] ", "done": "[DONE] ", "error": "[ERR]  ", "info": "[INFO] "}
    icon = icons.get(step, "[*]   ")
    print(f"  {icon}  {msg}")


def run_once(config: dict, content_type: str = None, zip_code: str = None):
    import random

    api_key = config.get("anthropic_api_key", os.getenv("ANTHROPIC_API_KEY", ""))
    zip_code = zip_code or random.choice(config.get("target_zip_codes", ["10001"]))
    content_type = content_type or random.choice(list(CONTENT_TEMPLATES.keys()))

    print(f"\n{'-'*55}")
    print(colored(f"  Running: {content_type.upper().replace('_', ' ')} | ZIP: {zip_code}", "cyan"))
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'-'*55}")

    # Step 1: Fetch data
    print_step("fetch", "Fetching live market data...")
    data = fetch_all_data(zip_code)
    rate = data["rates"]
    market = data["market"]
    direction_symbol = "(DOWN)" if rate["direction"] == "down" else "(UP)"
    print_step("info", f"  Rate: {rate['rate']}% ({rate['change']:+.2f}%) {direction_symbol}")
    print_step("info", f"  Market: {market['city']} | Median: ${market['median_price']:,} | DoM: {market['days_on_market']}d")

    # Step 2: Generate script
    if not api_key or api_key == "YOUR_ANTHROPIC_API_KEY":
        print_step("generate", "Generating script... (using fallback — set ANTHROPIC_API_KEY for AI generation)")
        script_data = {
            "script": f"Mortgage rates are at {rate['rate']}% this week — that's {abs(rate['change'])}% {'lower' if rate['direction'] == 'down' else 'higher'} than last week. On a $400,000 home, that means your monthly payment is ${round(400000 * rate['rate']/100/12 * (1+rate['rate']/100/12)**360 / ((1+rate['rate']/100/12)**360-1)):,}/month. If you've been waiting to buy in {market['city']}, now might be the time to act. Use Snaphomz to find homes in your budget at snaphomz.com",
            "caption": f"Rates moved to {rate['rate']}% {direction_symbol} - see what this means for buyers in {market['city']}! Link in bio. #realestate #mortgagerates #homebuying",
            "hashtags": ["realestate", "mortgagerates", "homebuying", "firsttimebuyer", "snaphomz", "housing", "realestatetips", "homeowner", "investment", "propertymarket"],
            "title": f"Mortgage Rate Alert — {rate['rate']}% | {market['city']}",
            "thumbnail_text": f"RATES: {rate['rate']}%"
        }
    else:
        print_step("generate", "Generating AI script with Claude...")
        try:
            script_data = generate_script(data, content_type, api_key)
        except Exception as e:
            print_step("error", f"AI generation failed: {e}")
            return

    print_step("done", f"Script: \"{script_data['title']}\"")
    print(colored(f"\n  SCRIPT PREVIEW:", "yellow"))
    script_lines = script_data["script"][:300]
    print(f"  {script_lines}{'...' if len(script_data['script']) > 300 else ''}\n")
    print(colored(f"  CAPTION:", "yellow"))
    caption_ascii = script_data['caption'].encode('ascii', errors='replace').decode('ascii')
    print(f"  {caption_ascii}\n")
    print(colored(f"  THUMBNAIL: \"{script_data['thumbnail_text']}\"", "yellow"))

    # Step 3: Publish
    post_bridge_key = config.get("post_bridge_api_key", "")
    print_step("post", "Publishing to social platforms...")

    if post_bridge_key and post_bridge_key != "YOUR_POST_BRIDGE_API_KEY":
        publisher = PostBridgePublisher(post_bridge_key)
        result = publisher.post_content(script_data["caption"])
    else:
        publisher = MockPublisher()
        result = publisher.post_content(script_data["caption"], script_data, "all")

    if result.get("success"):
        if result.get("simulated"):
            print_step("done", "Posts queued (demo mode — add PostBridge key to go live):")
            for post in result.get("posted_to", []):
                print(f"     • {post['platform']}: {post['status']} | Est. reach: {post['estimated_reach']}")
        else:
            print_step("done", "Published live!")

    # Step 4: Log + show impact
    logged = log_post(content_type, script_data["title"], ["TikTok", "Instagram", "YouTube"])
    simulated = simulate_engagement(logged["id"])

    post_metrics = next((p for p in simulated["posts"] if p["id"] == logged["id"]), None)
    if post_metrics:
        print(colored(f"\n  PROJECTED IMPACT (based on avg performance):", "green"))
        print(f"     Views: {post_metrics['views']:,}")
        print(f"     Clicks to Snaphomz: {post_metrics['clicks']:,}")
        print(f"     New signups: {post_metrics['signups']}")
        print(colored(f"     CAC for these {post_metrics['signups']} users: $0.00", "green"))
        print(colored(f"     vs Paid Ads: ${300 * post_metrics['signups']:,} saved\n", "green"))

    print(colored(f"  [DONE] Finished: {content_type.replace('_', ' ')} mode\n", "cyan"))


def run_scheduler(config: dict):
    import random
    from src.video.builder import generate_script_groq, build_video
    from src.social.youtube_uploader import upload_short, mock_upload

    groq_key   = config.get("groq_api_key", os.getenv("GROQ_API_KEY", ""))
    pexels_key = config.get("pexels_api_key", os.getenv("PEXELS_API_KEY", ""))
    can_post   = os.path.exists("client_secrets.json")

    print_step("info", "Scheduler active — fully automatic generate + post")
    print_step("info", f"  YouTube posting: {'LIVE' if can_post else 'DEMO (add client_secrets.json to go live)'}")
    post_times = config.get("post_times", ["09:00", "17:00"])

    def scheduled_job():
        zip_code     = random.choice(config.get("target_zip_codes", ["10001"]))
        content_type = random.choice(list(CONTENT_TEMPLATES.keys()))
        print_step("info", f"Running auto job: {content_type} | ZIP {zip_code}")

        try:
            data         = fetch_all_data(zip_code, content_type)
            script_data  = generate_script_groq(data, content_type, groq_key)
            build_result = build_video(script_data, content_type, zip_code, pexels_key=pexels_key)
            video_path   = build_result[0] if isinstance(build_result, tuple) else build_result

            if can_post:
                result = upload_short(video_path, script_data["title"], script_data["caption"])
                if result.get("success"):
                    print_step("done", f"Posted: {result.get('url')}")
            else:
                mock_upload(video_path, script_data["title"], script_data["caption"])
        except Exception as e:
            print_step("error", f"Job failed: {e}")

    for t in post_times:
        schedule.every().day.at(t).do(scheduled_job)
        print_step("info", f"  Scheduled: {t} daily")

    print_step("info", "Running first job now...\n")
    scheduled_job()

    while True:
        schedule.run_pending()
        time.sleep(60)


def main():
    print_header()
    config = load_config()

    if len(sys.argv) < 2:
        print(colored("  COMMANDS:", "yellow"))
        print("  python main.py run              — generate + post one piece of content now")
        print("  python main.py run rate_alert   — specific content type")
        print("  python main.py run market_update 10001 — specific type + ZIP")
        print("  python main.py make-video rate_alert 10001 — generate real MP4 video")
        print("  python main.py schedule         — run on auto-schedule (2x daily)")
        print("  python main.py dashboard        — show CAC analytics dashboard")
        print()
        print(colored("  CONTENT TYPES:", "yellow"))
        for ct in CONTENT_TEMPLATES:
            print(f"  • {ct}")
        print()
        return

    command = sys.argv[1]

    if command == "dashboard":
        display_dashboard()

    elif command == "run":
        content_type = sys.argv[2] if len(sys.argv) > 2 else None
        zip_code = sys.argv[3] if len(sys.argv) > 3 else None
        if content_type and content_type not in CONTENT_TEMPLATES:
            print(colored(f"  Invalid content type: {content_type}", "red"))
            print(f"  Options: {', '.join(CONTENT_TEMPLATES.keys())}")
            return
        run_once(config, content_type, zip_code)
        display_dashboard()

    elif command == "make-video":
        from src.video.builder import generate_script_groq, build_video
        from src.data.fetcher import fetch_all_data
        import random

        content_type = sys.argv[2] if len(sys.argv) > 2 else random.choice(list(CONTENT_TEMPLATES.keys()))
        zip_code     = sys.argv[3] if len(sys.argv) > 3 else "10001"
        groq_key     = config.get("groq_api_key", os.getenv("GROQ_API_KEY", ""))
        pexels_key   = config.get("pexels_api_key", os.getenv("PEXELS_API_KEY", ""))
        pixabay_key  = os.getenv("PIXABAY_API_KEY", "")

        if not groq_key or groq_key == "YOUR_GROQ_API_KEY":
            print(colored("  [ERR] Add groq_api_key to config.json", "red"))
            return

        has_pexels  = pexels_key  and pexels_key  != "YOUR_PEXELS_API_KEY"
        has_pixabay = pixabay_key and pixabay_key != "YOUR_PIXABAY_API_KEY"
        bg_mode     = "Pixabay video" if has_pixabay else ("Pexels photos" if has_pexels else "picsum.photos (free fallback)")
        print(colored(f"\n  Generating video: {content_type} | ZIP {zip_code}", "cyan"))
        print(colored(f"  Backgrounds: {bg_mode}", "yellow"))
        data = fetch_all_data(zip_code, content_type)
        print("  [FETCH] Live data loaded")

        print("  [GROQ]  Generating script...")
        script_data = generate_script_groq(data, content_type, groq_key)
        print(f"  [GROQ]  Script: \"{script_data['title']}\"")
        print(f"\n  SCRIPT PREVIEW:\n  {script_data['script'][:200]}...\n")

        result          = build_video(script_data, content_type, zip_code,
                                     pexels_key=pexels_key, pixabay_key=pixabay_key)
        video_path      = result[0] if isinstance(result, tuple) else result
        thumbnail_path  = result[2] if isinstance(result, tuple) and len(result) > 2 else None
        print(colored(f"\n  VIDEO READY: {video_path}", "green"))
        if thumbnail_path:
            print(colored(f"  THUMBNAIL:   {thumbnail_path}", "green"))
        print(colored(f"  Ready to post to TikTok/Instagram/YouTube\n", "green"))

    elif command == "post-video":
        # python main.py post-video output/MyVideo.mp4 "Title" "Description"
        from src.social.youtube_uploader import upload_short, mock_upload
        video_path  = sys.argv[2] if len(sys.argv) > 2 else None
        title       = sys.argv[3] if len(sys.argv) > 3 else "Real Estate Update | Snaphomz"
        description = sys.argv[4] if len(sys.argv) > 4 else "Stay ahead of the market. Visit snaphomz.com"

        if not video_path or not os.path.exists(video_path):
            print(colored("  [ERR] Provide valid video path: python main.py post-video output/video.mp4 'Title'", "red"))
        elif os.path.exists("client_secrets.json"):
            result = upload_short(video_path, title, description)
            if result.get("success"):
                print(colored(f"  [DONE] Live on YouTube Shorts: {result.get('url')}", "green"))
        else:
            result = mock_upload(video_path, title, description)
            print(colored("\n  To go live:", "yellow"))
            print("  1. console.cloud.google.com → new project")
            print("  2. Enable YouTube Data API v3")
            print("  3. Credentials → OAuth 2.0 Client ID → Desktop App → download JSON")
            print("  4. Save as client_secrets.json in snap-cac/")
            print("  5. Re-run: python main.py post-video <video> <title>")

    elif command == "auto":
        # Full pipeline: generate → show → ask → post
        from src.video.builder import generate_script_groq, build_video
        from src.social.youtube_uploader import upload_short, mock_upload
        import random

        content_type = sys.argv[2] if len(sys.argv) > 2 else random.choice(list(CONTENT_TEMPLATES.keys()))
        zip_code     = sys.argv[3] if len(sys.argv) > 3 else "10001"
        groq_key     = config.get("groq_api_key", os.getenv("GROQ_API_KEY", ""))
        pexels_key   = config.get("pexels_api_key", os.getenv("PEXELS_API_KEY", ""))
        pixabay_key  = os.getenv("PIXABAY_API_KEY", "")

        print(colored(f"\n  [AUTO] Generating: {content_type} | ZIP {zip_code}", "cyan"))

        from src.social.x_poster import post_to_x

        data        = fetch_all_data(zip_code, content_type)
        script_data = generate_script_groq(data, content_type, groq_key)
        result         = build_video(script_data, content_type, zip_code,
                                    pexels_key=pexels_key, pixabay_key=pixabay_key)
        video_path     = result[0] if isinstance(result, tuple) else result
        slide_imgs     = result[1] if isinstance(result, tuple) and len(result) > 1 else []
        thumbnail_path = result[2] if isinstance(result, tuple) and len(result) > 2 else None

        print(colored(f"\n  VIDEO READY: {video_path}", "green"))
        print(colored(f"  Title:     {script_data['title']}", "white"))
        print(colored(f"  Caption:   {script_data['caption'][:100]}", "white"))
        print(colored(f"  Slides:    {len(slide_imgs)} images saved", "white"))
        if thumbnail_path:
            print(colored(f"  Thumbnail: {thumbnail_path}", "white"))
        print()

        answer = input(colored("  Post to YouTube + X now? (y/n): ", "yellow")).strip().lower()
        if answer == "y":
            # YouTube Shorts
            print(colored("  [1/2] Posting to YouTube Shorts...", "cyan"))
            if os.path.exists("client_secrets.json"):
                yt = upload_short(video_path, script_data["title"], script_data["caption"],
                                  thumbnail_path=thumbnail_path)
                if yt.get("success"):
                    print(colored(f"  [YT] Live: {yt.get('url')}", "green"))
            else:
                mock_upload(video_path, script_data["title"], script_data["caption"],
                            thumbnail_path=thumbnail_path)

            # X/Twitter with slides
            print(colored("  [2/2] Posting to X with slides...", "cyan"))
            x = post_to_x(script_data["caption"], slide_imgs, script_data["title"])
            if x.get("success") and not x.get("simulated"):
                print(colored(f"  [X]  Live: {x.get('url')}", "green"))
        else:
            print(colored("  Skipped posting. Video + slides saved locally.", "yellow"))

    elif command == "schedule":
        run_scheduler(config)

    else:
        print(colored(f"  Unknown command: {command}", "red"))


if __name__ == "__main__":
    main()
