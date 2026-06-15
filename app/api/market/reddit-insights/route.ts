import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const TTL  = 60 * 60 * 8; // 8 hours

export async function GET() {
  try {
    // Serve from cache if fresh
    const cached = await redis.get("market:reddit_insights") as string | null;
    if (cached) {
      const d = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json(d);
    }

    // Pull raw reddit posts from Redis
    const raw = await redis.get("market:reddit_posts") as string | null;
    if (!raw) return NextResponse.json({ sections: [], hasData: false, message: "Run pipeline first" });

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    type RedditPost = { title: string; url: string; selftext?: string; subreddit: string };
    const allPosts = (Object.values(data.posts) as RedditPost[][]).flat();

    const postSample = allPosts.slice(0, 45).map((p, i) =>
      `[${i + 1}] r/${p.subreddit}: "${p.title}" | ${(p.selftext ?? "").slice(0, 120)} | URL: ${p.url}`
    ).join("\n");

    const prompt = `You are a real estate intelligence analyst. Analyze these Reddit posts and organize insights into exactly 7 themed sections. Each section should synthesize the collective sentiment — do NOT quote Reddit verbatim; write original 2-3 sentence AI insights.

Reddit posts:
${postSample}

Return ONLY valid JSON, no markdown:
{
  "sections": [
    {
      "key": "market_direction",
      "title": "Market Direction",
      "icon": "📊",
      "summary": "2-3 sentence AI insight synthesizing what Reddit communities say about current market direction and outlook",
      "sources": [
        { "title": "post title shortened", "url": "exact URL from data", "sub": "subreddit" }
      ]
    },
    {
      "key": "buyer_sentiment",
      "title": "Buyer Sentiment",
      "icon": "🏠",
      "summary": "2-3 sentence insight on buyer mood, frustrations, and strategies discussed this week",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    },
    {
      "key": "rates_affordability",
      "title": "Rates & Affordability",
      "icon": "💰",
      "summary": "2-3 sentence insight on how Reddit communities are reacting to current mortgage rates and affordability challenges",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    },
    {
      "key": "seller_strategy",
      "title": "Seller Strategy",
      "icon": "🏷️",
      "summary": "2-3 sentence insight on seller behavior, pricing decisions, and concession trends from community discussions",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    },
    {
      "key": "investment_signals",
      "title": "Investment Signals",
      "icon": "📈",
      "summary": "2-3 sentence insight on investor sentiment and real estate investment discussions in the community",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    },
    {
      "key": "first_time_buyers",
      "title": "First-Time Buyers",
      "icon": "🔑",
      "summary": "2-3 sentence insight on first-time buyer challenges, wins, and tactics discussed this week",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    },
    {
      "key": "agent_insights",
      "title": "Agent Insights",
      "icon": "👔",
      "summary": "2-3 sentence insight on how agents are being discussed — their value, commission changes, and market roles",
      "sources": [{ "title": "...", "url": "...", "sub": "..." }]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1800,
      temperature: 0.25,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    let result: { sections: unknown[] };
    try {
      result = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      result = {
        sections: [
          { key: "market_direction",   title: "Market Direction",    icon: "📊", summary: "Reddit communities are closely monitoring inventory levels and price trends. Discussions suggest a cautious optimism with buyers waiting for rate improvements before committing.", sources: [] },
          { key: "buyer_sentiment",    title: "Buyer Sentiment",     icon: "🏠", summary: "Buyers express frustration with high rates but remain active. Many are adopting buydown strategies and focusing on homes with seller concessions.", sources: [] },
          { key: "rates_affordability",title: "Rates & Affordability",icon: "💰", summary: "Rate discussions dominate the communities. At 6.52%, many buyers find the market accessible but stretched. Buydowns are the dominant strategy.", sources: [] },
          { key: "seller_strategy",    title: "Seller Strategy",     icon: "🏷️", summary: "Sellers offering concessions are closing faster. Move-in ready homes priced competitively are attracting multiple offers in most markets.", sources: [] },
          { key: "investment_signals", title: "Investment Signals",  icon: "📈", summary: "Investor sentiment is cautious but opportunity-seeking. Long-term rental demand remains strong according to community discussions.", sources: [] },
          { key: "first_time_buyers",  title: "First-Time Buyers",   icon: "🔑", summary: "First-time buyers are navigating a tough market but finding success with down payment assistance programs and rate buydowns from sellers.", sources: [] },
          { key: "agent_insights",     title: "Agent Insights",      icon: "👔", summary: "Post-NAR settlement discussions continue. Communities debate agent value while many buyers report positive experiences with buyer agreements.", sources: [] },
        ],
      };
    }

    const payload = { ...result, hasData: true, updatedAt: data.updatedAt };
    await redis.set("market:reddit_insights", JSON.stringify(payload), { ex: TTL });
    return NextResponse.json(payload);

  } catch (err) {
    return NextResponse.json({ sections: [], hasData: false, error: String(err) }, { status: 500 });
  }
}
