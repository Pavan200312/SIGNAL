import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

const SUBREDDIT_META: Record<string, { label: string; audience: string; color: string }> = {
  RealEstate:          { label: "r/RealEstate",          audience: "General",  color: "#FF4500" },
  FirstTimeHomeBuyer:  { label: "r/FirstTimeHomeBuyer",  audience: "Buyers",   color: "#FF6534" },
  Mortgages:           { label: "r/Mortgages",           audience: "Buyers",   color: "#E84C2B" },
  HousingMarket:       { label: "r/HousingMarket",       audience: "General",  color: "#FF4500" },
  realestateinvesting: { label: "r/realestateinvesting", audience: "Investors",color: "#CC3300" },
  RealEstateAgent:     { label: "r/RealEstateAgent",     audience: "Agents",   color: "#B03000" },
  homeowners:          { label: "r/homeowners",          audience: "Sellers",  color: "#D94000" },
  USHousingMarket:     { label: "r/USHousingMarket",     audience: "General",  color: "#FF4500" },
  REBubble:            { label: "r/REBubble",            audience: "General",  color: "#CC3300" },
};

export async function GET() {
  try {
    const raw = await redis.get("market:reddit_posts") as string | null;
    if (!raw) {
      return NextResponse.json({ subreddits: [], hasData: false, message: "No Reddit data. Run pipeline first." });
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const grouped = data.posts as Record<string, Array<{
      title: string; subreddit: string; type: string;
      url: string; selftext: string; score: number; comments: number;
    }>>;

    const subreddits = Object.entries(grouped).map(([sub, posts]) => ({
      subreddit: sub,
      label: SUBREDDIT_META[sub]?.label ?? `r/${sub}`,
      audience: SUBREDDIT_META[sub]?.audience ?? "General",
      color: SUBREDDIT_META[sub]?.color ?? "#FF4500",
      posts: posts.slice(0, 5).map(p => ({
        title: p.title,
        url: p.url,
        summary: p.selftext?.slice(0, 200) ?? "",
        type: p.type,
      })),
    }));

    return NextResponse.json({
      subreddits,
      hasData: true,
      updatedAt: data.updatedAt,
      totalPosts: Object.values(grouped).flat().length,
    });
  } catch (err) {
    return NextResponse.json({ subreddits: [], hasData: false, error: String(err) }, { status: 500 });
  }
}
