// Pipeline runner — orchestrates collect → process → store

import { collectRates, collectNews, collectRedditPosts, collectXPosts } from "./collect";
import { processWithClaude } from "./process";
import { storeIntelligence } from "./store";

export async function runPipeline() {
  console.log("[Pipeline] Starting — sources: Brave Search + Reddit + X + FRED");
  const startTime = Date.now();

  // Step 1: Collect ALL sources in parallel
  const [rates, news, redditPosts, xPosts] = await Promise.all([
    collectRates(),       // FRED — mortgage rates + market data
    collectNews(),        // Brave Search — news from entire internet
    collectRedditPosts(), // Reddit — 6 subreddits + 6 cities
    collectXPosts(),      // X/Twitter — via Brave Search index
  ]);

  // Merge X posts into news feed (both are web content)
  const allContent = [
    ...news,
    ...xPosts.map((x) => ({ ...x, category: x.topic })),
  ];

  console.log(`[Pipeline] Collected:
    FRED:    ${Object.keys(rates).length} rate series
    News:    ${news.length} articles (Brave Search)
    X/Twitter: ${xPosts.length} posts (via Brave)
    Reddit:  ${redditPosts.length} posts (${6} subreddits + 6 cities)
    Total:   ${allContent.length} content items`);

  // Step 2: Process with Claude — extract intelligence from all sources
  console.log("[Pipeline] Processing with Claude Haiku...");
  const intelligence = await processWithClaude(redditPosts, allContent, rates);

  // Step 3: Store split by category + user type into Redis
  console.log("[Pipeline] Storing to Redis (split by category + user type)...");
  const timestamp = await storeIntelligence(intelligence, rates, allContent, redditPosts);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Pipeline] Done in ${duration}s`);

  return {
    success: true,
    duration: `${duration}s`,
    collected: {
      fred_series: Object.keys(rates).length,
      news_articles: news.length,
      x_posts: xPosts.length,
      reddit_posts: redditPosts.length,
      total_content: allContent.length,
    },
    timestamp,
  };
}
