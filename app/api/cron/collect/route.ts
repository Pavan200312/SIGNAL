import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/app/lib/pipeline/runner";

// Manual trigger: GET /api/cron/collect?secret=snapsignal-cron
// TO AUTOMATE LATER: uncomment Windows Task Scheduler setup in scripts/run-pipeline.ps1
// schtasks /create /tn "SnapMarket Pipeline" /tr "powershell -File ...run-pipeline.ps1" /sc hourly /mo 6 /f

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== (process.env.CRON_SECRET ?? "snapsignal-cron")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPipeline();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Pipeline] Failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
