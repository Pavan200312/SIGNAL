"""
SnapCAC Flask API — called by SnapSignal dashboard to generate + serve videos.
Run: python api.py
Port: 5001
"""

import os
import sys
import json
import random
from datetime import datetime

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

sys.path.insert(0, os.path.dirname(__file__))

from src.data.fetcher import fetch_all_data, CONTENT_TEMPLATES

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
PEXELS_KEY = os.getenv("PEXELS_API_KEY", "")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "groq": bool(GROQ_KEY),
        "pexels": bool(PEXELS_KEY),
        "output_dir": OUTPUT_DIR,
        "content_types": list(CONTENT_TEMPLATES.keys()),
    })


@app.route("/generate-video", methods=["POST"])
def generate_video():
    """
    Body: { content_type, zip_code, signal_text }
    Returns: { success, video_url, title, caption, script }
    """
    from src.video.builder import generate_script_groq, build_video

    body         = request.json or {}
    content_type = body.get("content_type") or random.choice(list(CONTENT_TEMPLATES.keys()))
    zip_code     = body.get("zip_code", "10001")
    signal_text  = body.get("signal_text", "")

    if content_type not in CONTENT_TEMPLATES:
        return jsonify({"success": False, "error": f"Unknown content_type: {content_type}"}), 400

    if not GROQ_KEY:
        return jsonify({"success": False, "error": "GROQ_API_KEY not set"}), 503

    try:
        data = fetch_all_data(zip_code, content_type)
        if signal_text:
            data["signal_context"] = signal_text

        script_data    = generate_script_groq(data, content_type, GROQ_KEY)
        result         = build_video(script_data, content_type, zip_code, pexels_key=PEXELS_KEY)
        video_path     = result[0] if isinstance(result, tuple) else result
        slide_imgs     = result[1] if isinstance(result, tuple) and len(result) > 1 else []
        thumbnail_path = result[2] if isinstance(result, tuple) and len(result) > 2 else None
        filename       = os.path.basename(video_path)
        thumb_filename = os.path.basename(thumbnail_path) if thumbnail_path else None

        return jsonify({
            "success":       True,
            "video_url":     f"/serve-video/{filename}",
            "filename":      filename,
            "thumbnail_url": f"/serve-video/{thumb_filename}" if thumb_filename else None,
            "title":         script_data.get("title", ""),
            "caption":       script_data.get("caption", ""),
            "script":        script_data.get("script", ""),
            "slides":        len(slide_imgs),
            "generated_at":  datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/serve-video/<filename>")
def serve_video(filename):
    """Stream the generated MP4 file."""
    safe = os.path.basename(filename)  # prevent path traversal
    path = os.path.join(OUTPUT_DIR, safe)
    if not os.path.exists(path):
        return jsonify({"error": "Video not found"}), 404
    return send_file(path, mimetype="video/mp4", conditional=True)


@app.route("/post-video", methods=["POST"])
def post_video():
    """
    Body: { filename, title, caption, platforms: ["youtube", "x"] }
    Returns: { success, results: { youtube?, x? } }
    """
    body      = request.json or {}
    filename  = body.get("filename", "")
    title     = body.get("title", "Real Estate Update | Snaphomz")
    caption   = body.get("caption", "")
    platforms = body.get("platforms", ["youtube"])
    video_path = os.path.join(OUTPUT_DIR, os.path.basename(filename))

    if not os.path.exists(video_path):
        return jsonify({"success": False, "error": "Video file not found"}), 404

    results = {}

    thumbnail_path = os.path.join(OUTPUT_DIR, "thumbnail.jpg") if os.path.exists(os.path.join(OUTPUT_DIR, "thumbnail.jpg")) else None

    if "youtube" in platforms:
        if os.path.exists(os.path.join(os.path.dirname(__file__), "client_secrets.json")):
            from src.social.youtube_uploader import upload_short
            yt = upload_short(video_path, title, caption, thumbnail_path=thumbnail_path)
            results["youtube"] = yt
        else:
            results["youtube"] = {"success": True, "simulated": True, "url": "https://youtube.com/shorts/demo", "note": "Add client_secrets.json to go live"}

    if "x" in platforms:
        from src.social.x_poster import post_to_x
        # Use slide images saved alongside the video
        slide_imgs = [
            os.path.join(OUTPUT_DIR, f"slide_{i}.jpg")
            for i in range(4)
            if os.path.exists(os.path.join(OUTPUT_DIR, f"slide_{i}.jpg"))
        ]
        x = post_to_x(caption, slide_imgs, title)
        results["x"] = x

    return jsonify({"success": True, "results": results})


@app.route("/content-types")
def content_types():
    return jsonify({"types": list(CONTENT_TEMPLATES.keys())})


@app.route("/list-videos")
def list_videos():
    """Return all generated videos in output/ sorted by newest first."""
    videos = []
    for f in os.listdir(OUTPUT_DIR):
        if not f.endswith(".mp4"):
            continue
        path = os.path.join(OUTPUT_DIR, f)
        stat = os.stat(path)
        # Look for matching thumbnail (same name, .jpg)
        thumb = f.replace(".mp4", "_thumb.jpg")
        thumb_exists = os.path.exists(os.path.join(OUTPUT_DIR, thumb))
        videos.append({
            "filename":      f,
            "title":         f.replace(".mp4", ""),
            "video_url":     f"/serve-video/{f}",
            "thumbnail_url": f"/serve-video/{thumb}" if thumb_exists else None,
            "size_kb":       round(stat.st_size / 1024),
            "generated_at":  datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    videos.sort(key=lambda v: v["generated_at"], reverse=True)
    return jsonify({"videos": videos, "count": len(videos)})


if __name__ == "__main__":
    print(f"\n  SnapCAC API Server")
    print(f"  Port: 5001")
    print(f"  Groq: {'✓' if GROQ_KEY else '✗ (set GROQ_API_KEY)'}")
    print(f"  Pexels: {'✓' if PEXELS_KEY else '✗ (set PEXELS_API_KEY)'}")
    print(f"  Output: {OUTPUT_DIR}\n")
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
