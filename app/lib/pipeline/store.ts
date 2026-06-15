// Storage layer — splits processed data into Redis by category + user type

import { redis } from "@/app/lib/redis";
import type { ProcessedIntelligence } from "./process";

const TTL = 60 * 60 * 8; // 8 hours

export async function storeIntelligence(
  intelligence: ProcessedIntelligence,
  rates: Record<string, { value: number; date: string }>,
  news: Array<{ title: string; description: string; url: string; category: string; age?: string }>,
  redditPosts?: Array<{ title: string; subreddit: string; type: string; url: string; selftext: string; score: number; comments: number }>
) {
  const timestamp = new Date().toISOString();
  const payload = { ...intelligence, rates, news, updatedAt: timestamp };

  // Store AI-generated dashboard stats
  if (intelligence.dashboard_stats) {
    await redis.set("market:dashboard_stats", JSON.stringify({ stats: intelligence.dashboard_stats, updatedAt: timestamp }), { ex: TTL });
  }

  // Store raw Reddit posts grouped by subreddit
  if (redditPosts && redditPosts.length > 0) {
    const grouped: Record<string, typeof redditPosts> = {};
    for (const p of redditPosts) {
      if (!grouped[p.subreddit]) grouped[p.subreddit] = [];
      grouped[p.subreddit].push(p);
    }
    await redis.set("market:reddit_posts", JSON.stringify({ posts: grouped, updatedAt: timestamp }), { ex: TTL });
    // Invalidate cached Reddit AI insights so drawer regenerates with fresh posts
    await redis.del("market:reddit_insights");
  }

  // Store full payload
  await redis.set("market:full", JSON.stringify(payload), { ex: TTL });

  // Split by category — dashboard reads these independently
  await redis.set("market:rates", JSON.stringify({ rates, updatedAt: timestamp }), { ex: TTL });
  await redis.set("market:pain_points", JSON.stringify({ pain_points: intelligence.pain_points, updatedAt: timestamp }), { ex: TTL });
  await redis.set("market:trending", JSON.stringify({ trending_topics: intelligence.trending_topics, updatedAt: timestamp }), { ex: TTL });
  await redis.set("market:signals", JSON.stringify({ market_signals: intelligence.market_signals, updatedAt: timestamp }), { ex: TTL });
  await redis.set("market:city_sentiment", JSON.stringify({ city_sentiment: intelligence.city_sentiment, updatedAt: timestamp }), { ex: TTL });

  // Split by user type
  await redis.set("market:agent_view", JSON.stringify({
    summary: intelligence.weekly_summary.agent,
    pain_points: intelligence.pain_points.filter((p) => p.category === "agent" || p.category === "buyer"),
    trending: intelligence.trending_topics.filter((t) => t.affects === "agents" || t.affects === "all"),
    rates,
    updatedAt: timestamp,
  }), { ex: TTL });

  await redis.set("market:seller_view", JSON.stringify({
    summary: intelligence.weekly_summary.seller,
    pain_points: intelligence.pain_points.filter((p) => p.category === "seller" || p.category === "buyer"),
    trending: intelligence.trending_topics.filter((t) => t.affects === "sellers" || t.affects === "all"),
    market_signals: intelligence.market_signals,
    updatedAt: timestamp,
  }), { ex: TTL });

  await redis.set("market:buyer_view", JSON.stringify({
    summary: intelligence.weekly_summary.buyer,
    pain_points: intelligence.pain_points.filter((p) => p.category === "buyer"),
    trending: intelligence.trending_topics.filter((t) => t.affects === "buyers" || t.affects === "all"),
    rates,
    updatedAt: timestamp,
  }), { ex: TTL });

  // Split news by category pill
  const categories = ["market", "rates", "tech", "legal", "investment", "industry"];
  for (const cat of categories) {
    const filtered = news.filter((n) => n.category === cat).slice(0, 10);
    await redis.set(`market:news:${cat}`, JSON.stringify({ news: filtered, updatedAt: timestamp }), { ex: TTL });
  }

  // Store all news combined
  await redis.set("market:news:all", JSON.stringify({ news: news.slice(0, 30), updatedAt: timestamp }), { ex: TTL });

  console.log(`[Pipeline] Stored at ${timestamp}`);
  return timestamp;
}

export async function getMarketData(key: string) {
  const data = await redis.get(key);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}
