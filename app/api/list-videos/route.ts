import { NextResponse } from "next/server";

const SNAPCAC_URL = process.env.SNAPCAC_API_URL || "http://localhost:5001";

export async function GET() {
  try {
    const resp = await fetch(`${SNAPCAC_URL}/list-videos`, { cache: "no-store" });
    const data = await resp.json();
    // Rewrite video_url and thumbnail_url to go through Next.js proxy
    if (data.videos) {
      data.videos = data.videos.map((v: { filename: string; thumbnail_url: string | null; video_url: string; [key: string]: unknown }) => ({
        ...v,
        video_url:     `/api/serve-video/${v.filename}`,
        thumbnail_url: v.thumbnail_url ? `/api/serve-video/${v.filename.replace(".mp4", "_thumb.jpg")}` : null,
      }));
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ videos: [], count: 0, error: "SnapCAC not reachable" }, { status: 503 });
  }
}
