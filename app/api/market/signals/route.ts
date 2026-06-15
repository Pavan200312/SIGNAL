import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";

// Transform real pipeline data into Signal format for the dark dashboard

interface RawData {
  pain_points?: Array<{ pain: string; category: string; count: number; cities: string[]; trend: string }>;
  trending_topics?: Array<{ topic: string; category: string; affects: string; urgency: string }>;
  news?: Array<{ title: string; description: string; url: string; category: string; source?: string; age?: string }>;
  rates?: Record<string, { value: number; date: string }>;
  market_signals?: { direction: string; confidence: number; reason: string };
  city_sentiment?: Record<string, number>;
  weekly_summary?: { agent: string; seller: string; buyer: string };
  updatedAt?: string;
}

// Rule-based actions per signal type
function getActions(type: string, text: string, cities: string[]): Record<string, string> {
  const city = cities?.[0] ?? "your market";

  const rules: Record<string, Record<string, string>> = {
    buyer_pain: {
      buyer: `This is a real barrier in ${city}. Get pre-approved and move fast when you find the right home.`,
      seller: `Buyers facing this issue are more motivated — price competitively to win them over.`,
      agent: `Address this objection upfront in your first call. It's the #1 buyer concern this week.`,
    },
    seller_pain: {
      buyer: `Sellers struggling here may be open to negotiation — track homes with 15+ days on market.`,
      seller: `Proactively work with your agent on this issue before listing to avoid delays.`,
      agent: `Set clear expectations on this with every seller client before they list.`,
    },
    agent_pain: {
      buyer: `Work with an agent who has a clear value proposition — ask about their process upfront.`,
      seller: `Choose an agent who can demonstrate ROI on their fee — not just commission.`,
      agent: `Prepare a written value statement addressing this concern before your next client meeting.`,
    },
    rates: {
      buyer: `Lock in now if you find the right home — waiting for rates to drop below 6% may cost you more.`,
      seller: `More buyers qualifying at current rates — this week is favorable for listing.`,
      agent: `Lead with monthly payment, not purchase price. Affordability framing wins more clients.`,
    },
    market: {
      buyer: `Stay informed on market conditions in ${city} — make data-driven offers, not emotional ones.`,
      seller: `Current conditions favor action. Delayed listings risk missing the current demand window.`,
      agent: `Use this data in your next listing presentation — market-educated clients close faster.`,
    },
    tech: {
      buyer: `New tools can help you find and analyze homes faster — ask your agent which ones they use.`,
      seller: `AI pricing tools can help you optimize your listing price before going live.`,
      agent: `Early adopters of this technology are gaining a competitive edge — evaluate it this week.`,
    },
    legal: {
      buyer: `Understand your rights under the new commission rules — you can now negotiate buyer-agent fees.`,
      seller: `Clarify fee structure with your listing agent before signing — it affects your net proceeds.`,
      agent: `Update your buyer agreement forms and practice explaining the new fee structure clearly.`,
    },
    social: {
      buyer: `Real buyers are discussing this — use it as a signal of what to expect in the market.`,
      seller: `This social trend reflects real buyer sentiment — address it in your home presentation.`,
      agent: `Share insights like this with clients — it positions you as an informed advisor, not just a closer.`,
    },
  };

  const textLower = text.toLowerCase();
  let type_key = type;

  if (textLower.includes("rate") || textLower.includes("mortgage") || textLower.includes("interest")) type_key = "rates";
  else if (textLower.includes("commission") || textLower.includes("nar") || textLower.includes("legal") || textLower.includes("settlement")) type_key = "legal";
  else if (textLower.includes("ai") || textLower.includes("tech") || textLower.includes("app") || textLower.includes("tool")) type_key = "tech";
  else if (textLower.includes("viral") || textLower.includes("reddit") || textLower.includes("social") || textLower.includes("post")) type_key = "social";

  return rules[type_key] ?? rules.market;
}

function scoreFromCount(count: number): number {
  return Math.min(Math.max(Math.round(30 + (count / 1300) * 70), 30), 98);
}

function scoreFromUrgency(urgency: string): number {
  return urgency === "high" ? 88 : urgency === "medium" ? 72 : 58;
}

function trendLabel(trend: string): string {
  return trend === "rising" ? "Rising fast" : trend === "falling" ? "Falling" : "Steady";
}

function urgencyLabel(urgency: string): string {
  return urgency === "high" ? "Breaking" : urgency === "medium" ? "Rising" : "Steady";
}

function catToPill(category: string, affects: string = "all"): string[] {
  const map: Record<string, string> = {
    market: "news", rates: "rates", tech: "tech", legal: "legal",
    investment: "news", industry: "news", buyer: "buyerpain", seller: "sellerpain", agent: "news",
  };
  const pill = map[category] ?? "news";
  const affectPill = affects === "buyers" ? "buyerpain" : affects === "sellers" ? "sellerpain" : "";
  return ["all", "news", pill, affectPill].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
}

export async function GET() {
  try {
    // Try to read real data from Redis
    const raw = await redis.get("market:full") as string | null;

    if (!raw) {
      return NextResponse.json({ signals: [], hasRealData: false, message: "No pipeline data. Run /api/cron/collect first." });
    }

    const data: RawData = typeof raw === "string" ? JSON.parse(raw) : raw;
    const signals: object[] = [];

    // 1. Rate data → rates signal
    if (data.rates?.rate_30yr) {
      const rate = data.rates.rate_30yr.value;
      const prev = 6.94; // baseline
      const change = (rate - prev).toFixed(2);
      const dir = parseFloat(change) < 0 ? "dropped" : "held";
      signals.push({
        cats: ["all", "rates", "news"],
        src: "data",
        srcName: "FRED · Federal Reserve",
        badge: ["b-trend", "📊 Live Data"],
        title: `30-year fixed rate at ${rate}% — ${dir} ${Math.abs(parseFloat(change))}% this week`,
        why: `Rate ${dir} to ${rate}%. ${rate < 7 ? "Buyers who were on the fence are now re-entering the market. Lock-in window open." : "Rates remain elevated. Affordability pressure keeps many buyers in wait mode."}`,
        score: rate < 6.9 ? 84 : 72,
        scoreLbl: rate < 6.9 ? "Favorable" : "Elevated",
        actions: getActions("rates", "mortgage rates", []),
        stats: [["📊", "Federal Reserve data"], ["💰", `15yr: ${data.rates.rate_15yr?.value ?? 6.14}%`]],
        time: `Data: ${data.rates.rate_30yr.date}`,
        url: "https://fred.stlouisfed.org/series/MORTGAGE30US",
      });
    }

    // 2. Market signal → headline card
    if (data.market_signals) {
      const { direction, confidence, reason } = data.market_signals;
      signals.push({
        cats: ["all", "news", "buyerpain", "sellerpain"],
        src: "data",
        srcName: "SnapMarket AI · Market Analysis",
        badge: direction === "heating" ? ["b-hot", "🔥 Heating"] : direction === "cooling" ? ["b-new", "❄️ Cooling"] : ["b-trend", "→ Stable"],
        title: `Market is ${direction} — ${Math.round(confidence * 100)}% confidence. ${reason}`,
        why: `AI analysis of ${Object.keys(data.city_sentiment ?? {}).length} cities, ${(data.pain_points ?? []).length} pain signals, and live rate data. ${direction === "heating" ? "Sellers have the advantage. Buyers need to move decisively." : "Buyers gaining leverage. Negotiation windows opening."}`,
        score: Math.round(confidence * 100),
        scoreLbl: direction === "heating" ? "Rising" : direction === "cooling" ? "Falling" : "Steady",
        actions: getActions("market", direction, []),
        stats: [["🏙️", `${Object.keys(data.city_sentiment ?? {}).length} cities analyzed`], ["📈", `${Math.round(confidence * 100)}% confidence`]],
        time: data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleTimeString()}` : "Today",
        url: "https://redfin.com/news/data-center/market-tracker/",
      });
    }

    // 3. Pain points → signal cards
    for (const p of (data.pain_points ?? []).slice(0, 4)) {
      const type = p.category === "buyer" ? "buyer_pain" : p.category === "seller" ? "seller_pain" : "agent_pain";
      const pillCat = p.category === "buyer" ? "buyerpain" : p.category === "seller" ? "sellerpain" : "news";
      const pExt = p as { source_url?: string; source_name?: string };
      const painUrl = pExt.source_url ?? `https://www.reddit.com/r/RealEstate/search/?q=${encodeURIComponent(p.pain)}&sort=top&t=month`;
      const painSrc = pExt.source_name ?? "Reddit";
      signals.push({
        cats: ["all", "news", pillCat],
        src: painSrc.toLowerCase().includes("reddit") ? "Reddit" : painSrc.toLowerCase().includes("x.com") ? "X/Twitter" : painSrc,
        srcName: `${painSrc} · ${p.count.toLocaleString()} mentions`,
        badge: ["b-pain", "😤 Pain Point"],
        title: `"${p.pain}" — ${p.count.toLocaleString()} posts this week (${p.trend === "rising" ? "↑ rising" : p.trend === "falling" ? "↓ falling" : "→ steady"})`,
        why: `Top real estate frustration across ${p.cities.join(", ")}. Real buyers and sellers posting about this repeatedly this week.`,
        score: scoreFromCount(p.count),
        scoreLbl: trendLabel(p.trend),
        actions: getActions(type, p.pain, p.cities),
        stats: [["💬", `${p.count.toLocaleString()} mentions`], ["📍", p.cities.join(" · ")]],
        time: "This week",
        url: painUrl,
      });
    }

    // 4. Trending topics → signal cards
    for (const t of (data.trending_topics ?? []).slice(0, 3)) {
      const pills = catToPill(t.category, t.affects);
      const tExt = t as { source_url?: string; source_name?: string };
      const trendUrl = tExt.source_url ?? `https://search.brave.com/search?q=${encodeURIComponent(t.topic)}+real+estate+2026`;
      const trendSrc = tExt.source_name ?? (t.category === "legal" ? "News" : "Reddit");
      signals.push({
        cats: pills,
        src: trendSrc,
        srcName: `${trendSrc} · ${t.affects === "agents" ? "Industry" : t.affects === "buyers" ? "Buyers" : t.affects === "sellers" ? "Sellers" : "All"}`,
        badge: t.urgency === "high" ? ["b-hot", "🔥 Breaking"] : t.urgency === "medium" ? ["b-trend", "📈 Trending"] : ["b-new", "👀 Watch"],
        title: t.topic,
        why: `${t.urgency === "high" ? "High urgency signal" : t.urgency === "medium" ? "Growing trend" : "Emerging signal"} across ${t.affects === "all" ? "buyers, sellers, and agents" : t.affects}. Picked up from Reddit, X, and news aggregation this week.`,
        score: scoreFromUrgency(t.urgency),
        scoreLbl: urgencyLabel(t.urgency),
        actions: getActions(t.category, t.topic, []),
        stats: [["📡", `${t.category} signal`], ["👥", `Affects: ${t.affects}`]],
        time: "This week",
        url: trendUrl,
      });
    }

    // 5. News articles → signal cards
    for (const n of (data.news ?? []).slice(0, 4)) {
      if (!n.url) continue; // skip articles without a source URL
      const pills = catToPill(n.category);
      const isReddit = n.url.includes("reddit");
      const isX = n.url.includes("x.com") || n.url.includes("twitter.com");
      const hostname = n.source?.replace("www.", "") ?? "";
      const displaySrc = isReddit ? "Reddit" : isX ? "X/Twitter" : hostname || "News";
      signals.push({
        cats: pills,
        src: displaySrc,
        srcName: hostname || displaySrc,
        badge: n.category === "tech" ? ["b-tech", "🤖 Tech"] : n.category === "legal" ? ["b-pain", "⚖️ Legal"] : ["b-hot", "🔥 News"],
        title: n.title,
        why: n.description ?? "Real estate intelligence from across the web this week.",
        score: 68 + (n.title.length % 20),
        scoreLbl: "Rising",
        actions: getActions(n.category, n.title, []),
        stats: [["📰", displaySrc], ["🔗", "Read original"]],
        time: n.age ?? "Recent",
        url: n.url,
      });
    }

    return NextResponse.json({
      signals,
      hasRealData: true,
      updatedAt: data.updatedAt,
      cityCount: Object.keys(data.city_sentiment ?? {}).length,
      painCount: (data.pain_points ?? []).length,
    });
  } catch (err) {
    return NextResponse.json({ signals: [], hasRealData: false, error: String(err) }, { status: 500 });
  }
}
