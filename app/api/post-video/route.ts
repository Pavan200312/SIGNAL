import { NextRequest, NextResponse } from "next/server";

const SNAPCAC_URL = process.env.SNAPCAC_API_URL || "http://localhost:5001";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const resp = await fetch(`${SNAPCAC_URL}/post-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch {
    return NextResponse.json(
      { success: false, error: "SnapCAC server not running. Start: cd snap-cac && python api.py" },
      { status: 503 }
    );
  }
}
