import { NextRequest, NextResponse } from "next/server";

const SNAPCAC_URL = process.env.SNAPCAC_API_URL || "http://localhost:5001";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  try {
    const resp = await fetch(`${SNAPCAC_URL}/serve-video/${encodeURIComponent(filename)}`);

    if (!resp.ok) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const buffer = await resp.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "SnapCAC server not running" }, { status: 503 });
  }
}
