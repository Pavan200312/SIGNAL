// Demo data — shown when pipeline hasn't run yet
// News tagged by userType so each view gets relevant content

export const DEMO_DATA = {
  market_signals: {
    direction: "heating",
    confidence: 0.74,
    reason: "Low inventory + rate dip + spring demand = seller advantage in most metros",
  },
  city_sentiment: {
    Dallas: -0.3, Austin: -0.1, Nashville: 0.25,
    Phoenix: 0.1, Denver: -0.2, Atlanta: 0.15,
  },
  rates: {
    rate_30yr: { value: 6.82, date: "2026-05-28" },
    rate_15yr: { value: 6.14, date: "2026-05-28" },
    treasury_10yr: { value: 4.38, date: "2026-05-29" },
    housing_starts: { value: 1.32, date: "2026-04-01" },
    existing_home_sales: { value: 4.14, date: "2026-04-01" },
  },
  rateHistory: [
    { month: "Jun", rate: 7.22 }, { month: "Jul", rate: 6.96 },
    { month: "Aug", rate: 7.09 }, { month: "Sep", rate: 6.88 },
    { month: "Oct", rate: 6.74 }, { month: "Nov", rate: 6.91 },
    { month: "Dec", rate: 7.03 }, { month: "Jan", rate: 6.95 },
    { month: "Feb", rate: 6.87 }, { month: "Mar", rate: 6.79 },
    { month: "Apr", rate: 6.94 }, { month: "May", rate: 6.82 },
  ],

  // Pain points — tagged by who it affects
  pain_points: [
    { pain: "Can't win bidding wars",              for: ["buyer"],          category: "buyer",  count: 1247, cities: ["Dallas", "Austin"],    trend: "rising"  },
    { pain: "Mortgage rates still too high",        for: ["buyer"],          category: "buyer",  count: 834,  cities: ["nationwide"],           trend: "stable"  },
    { pain: "Low housing inventory",                for: ["buyer","seller"], category: "buyer",  count: 712,  cities: ["Nashville", "Denver"],  trend: "rising"  },
    { pain: "Agent not communicating fast enough",  for: ["buyer","agent"],  category: "buyer",  count: 445,  cities: ["Phoenix", "Atlanta"],   trend: "rising"  },
    { pain: "Appraisal gaps killing deals",         for: ["seller","agent"], category: "seller", count: 321,  cities: ["Dallas", "Miami"],      trend: "stable"  },
    { pain: "Buyers backing out at inspection",     for: ["seller","agent"], category: "seller", count: 287,  cities: ["nationwide"],           trend: "falling" },
    { pain: "AI platforms threatening commissions", for: ["agent"],          category: "agent",  count: 634,  cities: ["nationwide"],           trend: "rising"  },
    { pain: "NAR rules forcing buyer agreements",   for: ["agent"],          category: "agent",  count: 512,  cities: ["nationwide"],           trend: "rising"  },
    { pain: "Closing cost surprises",               for: ["buyer"],          category: "buyer",  count: 398,  cities: ["nationwide"],           trend: "stable"  },
    { pain: "Overpriced listings sitting too long", for: ["seller"],         category: "seller", count: 344,  cities: ["Austin", "Seattle"],    trend: "rising"  },
  ],

  // Hot topics — tagged by who it affects
  hot_topics: [
    { topic: "NAR commission settlement changing buyer agreements", for: ["agent"],          category: "legal",  urgency: "high"   },
    { topic: "AI buyer agents now closing real deals in Florida",   for: ["agent","seller"], category: "tech",   urgency: "high"   },
    { topic: "Spring inventory surge failed — shortage continues",  for: ["buyer","seller"], category: "market", urgency: "high"   },
    { topic: "Fed signals rate pause through summer 2026",          for: ["buyer"],          category: "rates",  urgency: "medium" },
    { topic: "Texas corporate relocation wave driving demand",      for: ["agent","seller"], category: "market", urgency: "medium" },
    { topic: "Bidding wars returning in Dallas and Nashville",      for: ["buyer","agent"],  category: "market", urgency: "high"   },
    { topic: "First-time buyer down payment programs expanded",     for: ["buyer"],          category: "market", urgency: "medium" },
    { topic: "Zillow AI search now matching 3× more buyers",       for: ["agent"],          category: "tech",   urgency: "medium" },
  ],

  // News — tagged by user type + pill category
  news: [
    {
      title: "NAR Commission Settlement: What Agents Must Do Now",
      description: "Post-settlement rules require buyer agents to sign written agreements before showing homes. Here's how top agents are adapting.",
      url: "https://inman.com/2026/05/nar-buyer-agreement-rules/",
      pill: "news", for: ["agent"], source: "Inman", age: "1h ago"
    },
    {
      title: "Homa AI Buyer Agent Announces Texas Expansion",
      description: "The Florida-based platform that closed first AI-only home purchases is moving into Dallas and Austin markets this Q3.",
      url: "https://www.businesswire.com/news/home/20251201257764/en/Homa-Announces-First-End-to-End-AI-Powered-Home-Purchases-in-the-United-States",
      pill: "tech", for: ["agent","seller"], source: "BusinessWire", age: "3h ago"
    },
    {
      title: "Dallas-Fort Worth Housing Inventory Falls to 5-Year Low",
      description: "Active listings in DFW dropped 18% year-over-year, pushing days-on-market to just 9 days for correctly priced homes.",
      url: "https://housingwire.com/articles/dallas-fort-worth-housing-market-2026/",
      pill: "market", for: ["agent","seller","buyer"], source: "HousingWire", age: "2h ago"
    },
    {
      title: "Fed Signals No Rate Cuts Until Q3 2026",
      description: "Federal Reserve holds rates steady. Mortgage rates expected to stay near 6.8% through summer, then potentially ease in fall.",
      url: "https://www.reuters.com/markets/rates-bonds/fed-rate-decision-2026/",
      pill: "market", for: ["buyer","seller"], source: "Reuters", age: "4h ago"
    },
    {
      title: "Zillow Launches AI-Powered Offer Intelligence Tool",
      description: "Zillow's new feature uses machine learning to recommend offer prices based on comparable sales and market conditions.",
      url: "https://zillow.com/research/zillow-offer-intelligence-2026/",
      pill: "tech", for: ["buyer","agent"], source: "Zillow Research", age: "5h ago"
    },
    {
      title: "First-Time Buyer Programs Expanded in Texas, Florida",
      description: "New state-backed down payment assistance programs now cover buyers earning up to 120% of area median income.",
      url: "https://www.hud.gov/press/press_releases_media_advisories/2026/first-time-buyer-assistance",
      pill: "news", for: ["buyer"], source: "HUD.gov", age: "6h ago"
    },
    {
      title: "Home Prices Rise 4.2% Year-Over-Year — Case-Shiller",
      description: "Despite elevated rates, home prices continued climbing in most metros. Dallas and Miami lead with 6%+ annual appreciation.",
      url: "https://www.spglobal.com/spdji/en/indices/real-estate/sp-corelogic-case-shiller-home-price-indices/",
      pill: "market", for: ["seller","agent"], source: "Case-Shiller", age: "8h ago"
    },
    {
      title: "Redfin Reports Bidding Wars Back in Hot Markets",
      description: "47% of offers in Dallas faced competition in April — highest rate since 2022. Buyers writing 3+ offers before winning.",
      url: "https://www.redfin.com/news/housing-market-bidding-wars-2026/",
      pill: "market", for: ["buyer","agent"], source: "Redfin", age: "10h ago"
    },
    {
      title: "AI Tools Now Helping Sellers Price Homes Accurately",
      description: "New AI valuation tools reduce time-on-market by 23% when sellers use them to price within 2% of actual market value.",
      url: "https://inman.com/2026/05/ai-home-pricing-tools-2026/",
      pill: "tech", for: ["seller"], source: "Inman", age: "12h ago"
    },
    {
      title: "Mortgage Applications Jump 8% as Rates Edge Lower",
      description: "Weekly mortgage applications rose sharply as the 30yr rate dipped to 6.82%, bringing buyers off the sidelines.",
      url: "https://www.mba.org/news-research-and-resources/research-and-economics/single-family-research/weekly-applications-survey",
      pill: "market", for: ["buyer"], source: "MBA", age: "1d ago"
    },
    {
      title: "PropTech Investment Hits $4.2B in Q1 2026",
      description: "Venture capital poured into AI-powered real estate platforms at record pace. AI search and transaction tools lead funding rounds.",
      url: "https://www.crunchbase.com/discover/funding_rounds/proptech-2026/",
      pill: "tech", for: ["agent"], source: "Crunchbase", age: "1d ago"
    },
    {
      title: "Sellers Overpricing Listings by 6% on Average — Study",
      description: "Analysis of 50,000 listings shows sellers who reduce price within 30 days ultimately sell for 3% less than if priced right from day one.",
      url: "https://therealdeal.com/national/2026/05/overpricing-study/",
      pill: "news", for: ["seller"], source: "The Real Deal", age: "1d ago"
    },
  ],

  updatedAt: new Date().toISOString(),
};

export type DashboardData = typeof DEMO_DATA;
