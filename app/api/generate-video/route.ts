import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120; // allow up to 2 min for video generation

const SNAPCAC_URL = process.env.SNAPCAC_API_URL || "http://localhost:5001";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const resp = await fetch(`${SNAPCAC_URL}/generate-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(110_000), // 110s — under the 120s route max
    });

    const data = await resp.json();

    // Rewrite internal serve-video URL to go through our Next.js proxy
    if (data.video_url) {
      data.video_url = `/api/serve-video/${data.filename}`;
    }

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("abort") || msg.includes("timeout") || msg.includes("The operation was aborted");
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? "Video generation timed out (>110s). Flask is running — try a shorter signal or check snap-cac logs."
          : `SnapCAC error: ${msg}. Start: cd snap-cac && python api.py`,
      },
      { status: 503 }
    );
  }
}
