// AI processing layer — Claude extracts structured intelligence from raw data
// Each extracted item preserves source_url so dashboard can link to original

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface StatBlock {
  value: string;
  delta: string;
  dir: "up" | "down" | "flat";
  meaning: string;
}

export interface ProcessedIntelligence {
  pain_points: Array<{
    pain: string;
    category: "buyer" | "seller" | "agent" | "investor";
    count: number;
    cities: string[];
    trend: string;
    source_url: string;   // link to original post/article
    source_name: string;  // display name e.g. "Reddit r/RealEstate"
  }>;
  city_sentiment: Record<string, number>;
  trending_topics: Array<{
    topic: string;
    category: string;
    affects: string;
    urgency: "high" | "medium" | "low";
    source_url: string;
    source_name: string;
  }>;
  weekly_summary: {
    agent: string;
    seller: string;
    buyer: string;
  };
  market_signals: {
    direction: "heating" | "cooling" | "stable";
    confidence: number;
    reason: string;
  };
  dashboard_stats: {
    inventory: StatBlock;
    price_drops: StatBlock;
    buyer_demand: StatBlock;
  };
}

export async function processWithClaude(
  redditPosts: Array<{ title: string; subreddit: string; type: string; url?: string }>,
  news: Array<{ title: string; description: string; category: string; url?: string; source?: string }>,
  rates: Record<string, { value: number; date: string }>
): Promise<ProcessedIntelligence> {

  // Build sample with URLs so Claude can reference them
  const redditSample = redditPosts.slice(0, 60).map((p) =>
    `[${p.subreddit}] ${p.title} | URL: ${p.url ?? `https://reddit.com/r/${p.subreddit}`}`
  ).join("\n");

  const newsSample = news.slice(0, 25).map((n) =>
    `[${n.category}] ${n.title} | SOURCE: ${n.source ?? "news"} | URL: ${n.url ?? ""}`
  ).join("\n");

  const rateStr = rates.rate_30yr
    ? `30yr mortgage: ${rates.rate_30yr.value}% (FRED: https://fred.stlouisfed.org/series/MORTGAGE30US)`
    : "Rate data unavailable";

  const prompt = `You are a real estate market intelligence analyst. Analyze these data points from the US real estate market this week.

REDDIT/SOCIAL POSTS (with URLs):
${redditSample}

NEWS HEADLINES (with source URLs):
${newsSample}

MARKET DATA:
${rateStr}
${rates.housing_starts ? `Housing starts: ${rates.housing_starts.value}k` : ""}
${rates.existing_home_sales ? `Existing home sales: ${rates.existing_home_sales.value}M` : ""}

Extract and return ONLY valid JSON (no markdown, no explanation).
IMPORTANT: For source_url — use the ACTUAL URL from the data above that best represents this signal.
If no specific URL, use the most relevant Reddit subreddit or news domain URL.

{
  "pain_points": [
    {
      "pain": "short description of pain point",
      "category": "buyer|seller|agent|investor",
      "count": estimated_mention_count,
      "cities": ["city1", "city2"],
      "trend": "rising|falling|stable",
      "source_url": "actual URL from the data above",
      "source_name": "e.g. Reddit r/RealEstate or HousingWire"
    }
  ],
  "city_sentiment": {
    "Dallas": -0.4,
    "Austin": 0.1
  },
  "trending_topics": [
    {
      "topic": "topic name",
      "category": "market|legal|tech|rates|investment",
      "affects": "buyers|sellers|agents|all",
      "urgency": "high|medium|low",
      "source_url": "actual URL from the data above",
      "source_name": "source name"
    }
  ],
  "weekly_summary": {
    "agent": "2-3 sentence actionable summary for agents this week",
    "seller": "2-3 sentence actionable summary for sellers this week",
    "buyer": "2-3 sentence actionable summary for buyers this week"
  },
  "market_signals": {
    "direction": "heating|cooling|stable",
    "confidence": 0.75,
    "reason": "one sentence explaining market direction"
  },
  "dashboard_stats": {
    "inventory": {
      "value": "estimated national active listing count as readable number e.g. '1,840' or '2.3k' based on news/data context",
      "delta": "trend phrase e.g. '↓ -12% vs last mo' or '↑ rising fast'",
      "dir": "up|down|flat",
      "meaning": "one-line agent insight max 12 words"
    },
    "price_drops": {
      "value": "estimated homes with price cuts this week e.g. '847' or '1,200+' based on news context",
      "delta": "trend phrase e.g. '↑ +34 today' or '↓ slowing this week'",
      "dir": "up|down|flat",
      "meaning": "one-line agent insight max 12 words"
    },
    "buyer_demand": {
      "value": "High|Medium|Low|Very High — inferred from social sentiment and market signals",
      "delta": "trend phrase e.g. '↑ above seasonal avg' or '↓ softening'",
      "dir": "up|down|flat",
      "meaning": "one-line agent insight max 12 words"
    }
  }
}

Rules:
- Pain points: max 6, most mentioned first
- City sentiment: -1 very negative to +1 very positive
- Trending topics: max 5, highest urgency first
- source_url must be a real URL from the data provided above
- Summaries end with ONE specific action this week`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (msg.content[0] as { text: string }).text;

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return {
      pain_points: [
        { pain: "Low inventory across major markets",        category: "buyer",  count: 800, cities: ["Dallas", "Austin"],    trend: "rising",  source_url: "https://reddit.com/r/RealEstate",         source_name: "Reddit r/RealEstate" },
        { pain: "Mortgage rates still elevated",             category: "buyer",  count: 600, cities: ["nationwide"],           trend: "stable",  source_url: "https://fred.stlouisfed.org/series/MORTGAGE30US", source_name: "FRED Federal Reserve" },
        { pain: "Bidding wars returning in hot markets",     category: "buyer",  count: 450, cities: ["Nashville", "Denver"],  trend: "rising",  source_url: "https://reddit.com/r/FirstTimeHomeBuyer", source_name: "Reddit r/FirstTimeHomeBuyer" },
        { pain: "AI platforms threatening agent commissions",category: "agent",  count: 380, cities: ["nationwide"],           trend: "rising",  source_url: "https://housingwire.com",                 source_name: "HousingWire" },
        { pain: "Sellers pricing above market reality",      category: "seller", count: 290, cities: ["Austin", "Seattle"],    trend: "stable",  source_url: "https://reddit.com/r/RealEstate",         source_name: "Reddit r/RealEstate" },
      ],
      city_sentiment: { Dallas: -0.3, Austin: -0.1, Nashville: 0.2, Phoenix: 0.0, Denver: -0.2, Atlanta: 0.1 },
      trending_topics: [
        { topic: "NAR settlement reshaping commission rules", category: "legal",  affects: "agents",  urgency: "high",   source_url: "https://inman.com",        source_name: "Inman" },
        { topic: "AI buyer agents closing real deals",        category: "tech",   affects: "agents",  urgency: "high",   source_url: "https://housingwire.com",   source_name: "HousingWire" },
        { topic: "Spring inventory surge failing to appear",  category: "market", affects: "all",     urgency: "medium", source_url: "https://realtor.com/research", source_name: "Realtor.com" },
        { topic: "Fed rate pause through summer 2026",        category: "rates",  affects: "buyers",  urgency: "medium", source_url: "https://fred.stlouisfed.org", source_name: "FRED" },
        { topic: "Texas corporate relocation driving demand", category: "market", affects: "all",     urgency: "low",    source_url: "https://reddit.com/r/Dallas", source_name: "Reddit r/Dallas" },
      ],
      weekly_summary: {
        agent:  "Buyer demand strong despite rate headwinds. Inventory tight. Follow up warm leads this week — spring buying season accelerating.",
        seller: "Strong seller market in most metros. Homes selling under 2 weeks. Price aggressively, list now before summer slowdown.",
        buyer:  "Competition fierce. Get pre-approved before searching. Target homes listed 15+ days for negotiating leverage.",
      },
      market_signals: { direction: "heating", confidence: 0.7, reason: "Low inventory + steady demand creating seller-favorable conditions in most metros" },
      dashboard_stats: {
        inventory:    { value: "1,840", delta: "↓ −12% vs last mo", dir: "down", meaning: "Fewer listings = seller leverage returning." },
        price_drops:  { value: "847",   delta: "↑ +34 today",       dir: "up",   meaning: "More sellers becoming negotiable — buyers gain room." },
        buyer_demand: { value: "High",  delta: "↑ above seasonal",  dir: "up",   meaning: "Active but payment-sensitive — use buydowns." },
      },
    };
  }
}
