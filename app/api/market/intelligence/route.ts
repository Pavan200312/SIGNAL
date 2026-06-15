import { NextRequest, NextResponse } from "next/server";
import { getMarketData } from "@/app/lib/pipeline/store";

// Dashboard calls this — returns split data by user type + pill
export async function GET(req: NextRequest) {
  const userType = req.nextUrl.searchParams.get("type") ?? "agent"; // agent|seller|buyer
  const pill = req.nextUrl.searchParams.get("pill") ?? "all"; // all|rates|market|tech|legal|pain|trending

  const [viewData, fullSignals, cityData, news, dashStats] = await Promise.all([
    getMarketData(`market:${userType}_view`),
    getMarketData("market:signals"),
    getMarketData("market:city_sentiment"),
    getMarketData(pill === "all" ? "market:news:all" : `market:news:${pill}`),
    getMarketData("market:dashboard_stats"),
  ]);

  if (!viewData) {
    return NextResponse.json(
      { error: "No data yet. Run /api/cron/collect?secret=snapsignal-cron first." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    userType,
    pill,
    ...viewData,
    market_signals: fullSignals?.market_signals,
    city_sentiment: cityData?.city_sentiment,
    news: news?.news ?? [],
    dashboard_stats: dashStats?.stats ?? null,
    updatedAt: viewData.updatedAt,
  });
}
