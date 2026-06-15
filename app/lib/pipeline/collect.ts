// Data collection layer — pulls from all sources in parallel
// Sources: Brave Search (news + X/Twitter) + Reddit + FRED
// Manual trigger: GET /api/cron/collect?secret=snapsignal-cron
// TO AUTOMATE LATER: re-enable Windows Task Scheduler in scripts/run-pipeline.ps1

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const FRED_KEY = process.env.FRED_API_KEY!;
const BRAVE_KEY = process.env.BRAVE_SEARCH_API_KEY!;

// ─────────────────────────────────────────
// FRED — mortgage rates + market data
// ─────────────────────────────────────────
export async function collectRates() {
  const series = {
    rate_30yr:           "MORTGAGE30US",
    rate_15yr:           "MORTGAGE15US",
    treasury_10yr:       "DGS10",
    home_price_index:    "MSPUS",
    existing_home_sales: "EXHOSLUSM495S",
    housing_starts:      "HOUST",
    building_permits:    "PERMIT",
  };

  const results: Record<string, { value: number; date: string }> = {};

  await Promise.all(
    Object.entries(series).map(async ([key, seriesId]) => {
      try {
        const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&sort_order=desc&limit=2&file_type=json`;
        const res = await fetch(url);
        const data = await res.json();
        const obs = data?.observations ?? [];
        const latest = obs.find((o: { value: string }) => o.value !== ".");
        if (latest) results[key] = { value: parseFloat(latest.value), date: latest.date };
      } catch { /* skip */ }
    })
  );

  return results;
}

// ─────────────────────────────────────────
// Brave Search helper
// ─────────────────────────────────────────
async function braveSearch(
  query: string,
  count = 10,
  freshness?: string
): Promise<Array<{ title: string; description: string; url: string; age?: string; source?: string }>> {
  try {
    const freshnessParam = freshness ? `&freshness=${freshness}` : "";
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}${freshnessParam}`,
      { headers: { "X-Subscription-Token": BRAVE_KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.web?.results ?? []).map((r: { title: string; description?: string; url: string; age?: string; meta_url?: { hostname?: string } }) => ({
      title: r.title,
      description: r.description ?? "",
      url: r.url,
      age: r.age,
      source: r.meta_url?.hostname ?? "",
    }));
  } catch { return []; }
}

// ─────────────────────────────────────────
// Brave Search — news from entire internet
// ─────────────────────────────────────────
export async function collectNews() {
  const queries = [
    { q: "US housing market news 2026",                          category: "market"     },
    { q: "mortgage rates news USA today 2026",                   category: "rates"      },
    { q: "NAR real estate news 2026",                            category: "industry"   },
    { q: "proptech AI real estate news 2026",                    category: "tech"       },
    { q: "real estate investing news USA 2026",                  category: "investment" },
    { q: "home prices forecast USA 2026",                        category: "market"     },
    { q: "housing inventory shortage USA 2026",                  category: "market"     },
    { q: "real estate law changes USA 2026",                     category: "legal"      },
    { q: "first time homebuyer news USA 2026",                   category: "market"     },
    { q: "foreclosure rates USA 2026",                           category: "market"     },
    { q: "real estate agent commission news 2026",               category: "industry"   },
    { q: "new home construction USA news 2026",                  category: "market"     },
    // Seller-specific signals
    { q: "sellers pulling homes off market USA 2026",            category: "seller"     },
    { q: "home sellers reducing price USA 2026",                 category: "seller"     },
    { q: "when to sell home USA market 2026",                    category: "seller"     },
    { q: "housing market seller advice USA 2026",                category: "seller"     },
    // Buyer-specific signals
    { q: "first time buyer tips home purchase USA 2026",         category: "buyer"      },
    { q: "buyers losing bidding wars USA housing 2026",          category: "buyer"      },
    { q: "best time to buy house USA 2026",                      category: "buyer"      },
    // Agent-specific signals
    { q: "real estate agent tools technology 2026",              category: "agent"      },
    { q: "realtor commission negotiation buyer agent 2026",      category: "agent"      },
  ];

  const all: Array<{
    title: string; description: string; url: string;
    category: string; age?: string; source?: string
  }> = [];

  for (const { q, category } of queries) {
    const results = await braveSearch(q, 5, "pw");
    results.forEach((r) => all.push({ ...r, category }));
    await new Promise((r) => setTimeout(r, 350));
  }

  const seen = new Set<string>();
  return all.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

// ─────────────────────────────────────────
// X (Twitter) — via Brave Search
// X API is gated/expensive → Brave indexes X posts + threads
// ─────────────────────────────────────────
export async function collectXPosts() {
  const queries = [
    { q: "site:x.com real estate housing market USA 2026",   topic: "market"    },
    { q: "site:x.com mortgage rates USA homebuyers 2026",    topic: "rates"     },
    { q: "site:x.com housing inventory USA real estate",     topic: "inventory" },
    { q: "site:x.com NAR realtor commission 2026",           topic: "industry"  },
    { q: "site:x.com proptech AI home buying 2026",          topic: "tech"      },
    { q: "site:x.com first time homebuyer struggling USA",   topic: "buyers"    },
    { q: "site:x.com home prices dropping USA 2026",         topic: "prices"    },
    { q: "site:x.com bidding war multiple offers housing",   topic: "market"    },
  ];

  const allPosts: Array<{
    title: string; description: string; url: string;
    topic: string; source: string
  }> = [];

  for (const { q, topic } of queries) {
    const results = await braveSearch(q, 4);
    results.forEach((r) => allPosts.push({ ...r, topic, source: "X/Twitter" }));
    await new Promise((r) => setTimeout(r, 400));
  }

  const seen = new Set<string>();
  return allPosts.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

// ─────────────────────────────────────────
// Reddit — direct JSON API (append .json to any Reddit URL)
// No API key, no OAuth — fully public
// e.g. reddit.com/r/RealEstate/hot.json?limit=25
// ─────────────────────────────────────────
const REDDIT_SUBREDDITS = [
  { sub: "RealEstate",          type: "general" },
  { sub: "FirstTimeHomeBuyer",  type: "buyer"   },
  { sub: "Mortgages",           type: "buyer"   },
  { sub: "HousingMarket",       type: "general" },
  { sub: "realestateinvesting", type: "agent"   },
  { sub: "homeowners",          type: "seller"  },
  { sub: "RealEstateAgent",     type: "agent"   },
];

async function fetchSubredditHot(subreddit: string, limit = 15): Promise<Array<{
  title: string; score: number; comments: number;
  url: string; permalink: string; created: number; selftext: string;
}>> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const posts = data?.data?.children ?? [];
    return posts
      .filter((p: { data: { stickied: boolean } }) => !p.data.stickied)
      .map((p: { data: {
        title: string; score: number; num_comments: number;
        url: string; permalink: string; created_utc: number; selftext: string;
      }}) => ({
        title:     p.data.title,
        score:     p.data.score,
        comments:  p.data.num_comments,
        url:       `https://reddit.com${p.data.permalink}`,
        permalink: p.data.permalink,
        created:   p.data.created_utc,
        selftext:  p.data.selftext?.slice(0, 300) ?? "",
      }));
  } catch { return []; }
}

export async function collectRedditPosts() {
  const allPosts: Array<{
    title: string; score: number; comments: number;
    subreddit: string; type: string; created: number;
    url: string; selftext: string;
  }> = [];

  // Primary: direct Reddit JSON API (public, no key needed)
  for (const { sub, type } of REDDIT_SUBREDDITS) {
    const posts = await fetchSubredditHot(sub, 15);
    posts.forEach(p => allPosts.push({
      title:    p.title,
      score:    p.score,
      comments: p.comments,
      subreddit: sub,
      type,
      created:  p.created,
      url:      p.url,
      selftext: p.selftext,
    }));
    await new Promise(r => setTimeout(r, 300));
  }

  // Fallback: Brave Search if direct API returned nothing (Reddit blocking)
  if (allPosts.length < 10) {
    console.log("[Pipeline] Reddit direct API blocked — falling back to Brave Search");
    const queries = [
      { q: "site:reddit.com RealEstate housing market buyers sellers USA 2026",       sub: "RealEstate",         type: "general" },
      { q: "site:reddit.com FirstTimeHomeBuyer mortgage rates buydown USA 2026",      sub: "FirstTimeHomeBuyer", type: "buyer"   },
      { q: "site:reddit.com Mortgages interest rate buydown first home USA 2026",     sub: "Mortgages",          type: "buyer"   },
      { q: "site:reddit.com housing market home prices inventory USA 2026",           sub: "HousingMarket",      type: "general" },
      { q: "site:reddit.com realestateinvesting cashflow rental property USA 2026",   sub: "realestateinvesting",type: "agent"   },
      { q: "site:reddit.com RealEstateAgent commission NAR buyer agreement 2026",     sub: "RealEstateAgent",    type: "agent"   },
      { q: "site:reddit.com homeowners selling home tips price drop 2026",            sub: "homeowners",         type: "seller"  },
    ];
    for (const { q, sub, type } of queries) {
      const results = await braveSearch(q, 8);
      results.filter(r => r.url.includes("reddit.com")).forEach(r => allPosts.push({
        title:    r.title,
        score:    0,
        comments: 0,
        subreddit: sub,
        type,
        created:  Date.now() / 1000,
        url:      r.url,
        selftext: r.description ?? "",
      }));
      await new Promise(r => setTimeout(r, 400));
    }
  }

  const seen = new Set<string>();
  return allPosts.filter(p => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });
}

// Legacy city search — kept for structure compatibility
async function _unusedCitySearch() {
  const cities = ["Dallas", "Austin", "Nashville", "Phoenix", "Denver", "Atlanta"];
  const allPosts: Array<{title: string; score: number; comments: number; subreddit: string; type: string; created: number}> = [];
  for (const city of cities) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${city}/search.json?q=home+buying+real+estate&sort=hot&limit=5&t=week`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children ?? [];
      posts.forEach((p: { data: { title: string; score: number; num_comments: number; created_utc: number } }) => {
        allPosts.push({
          title: p.data.title,
          score: p.data.score,
          comments: p.data.num_comments,
          subreddit: city,
          type: "city",
          created: p.data.created_utc,
        });
      });
      await new Promise((r) => setTimeout(r, 500));
    } catch { continue; }
  }
  return allPosts;
}

// ─────────────────────────────────────────
// Trending — top viral real estate topics
// ─────────────────────────────────────────
export async function collectTrending() {
  return braveSearch("trending real estate topic USA this week 2026", 8);
}
