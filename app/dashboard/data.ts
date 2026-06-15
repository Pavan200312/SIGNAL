export type Role = "agent" | "seller" | "buyer" | null;
export type SigTab = "All" | "News" | "Market" | "Rates" | "Trends" | "Pain";

export const PRIORITY: Record<string, { headline: string; action: string; cta: string }> = {
  agent:  { headline: "Rate dropped 0.41% — buyer affordability just improved.", action: "Contact your 4 waiting buyers today before competitors do.", cta: "Send Rate Update" },
  buyer:  { headline: "847 homes dropped price this week — negotiating leverage is real.", action: "Review price drops in your saved search and schedule tours.", cta: "View Price Drops" },
  seller: { headline: "Inventory tightening for 3rd week — this is the listing window.", action: "Price competitively and list before summer slowdown.", cta: "Get Pricing Report" },
};

export const STATS: Record<string, Array<{ label: string; value: string; delta: string; dir: "up"|"down"|"flat"; accent?: boolean; meaning: string; spark: number[] }>> = {
  agent: [
    { label: "30yr Rate Today",  value: "6.53%", delta: "↓ −0.41 this week", dir: "up",   meaning: "More buyers now qualify — contact waitlist.",           spark: [8,7,9,8,9,8,8,7,8,7,7,6] },
    { label: "Active Inventory", value: "1,840",  delta: "↓ −12% vs last mo", dir: "down", meaning: "Fewer listings = seller leverage returning.",            spark: [9,9,8,8,7,7,6,6,5,5,5,4] },
    { label: "Price Drops",      value: "847",    delta: "↑ +34 today",       dir: "up",   accent: true, meaning: "More sellers becoming negotiable.",         spark: [3,3,4,5,5,5,6,7,7,8,8,9] },
    { label: "Buyer Demand",     value: "High",   delta: "↑ above seasonal",  dir: "up",   accent: true, meaning: "Active but payment-sensitive — use buydowns.", spark: [4,5,5,6,6,7,7,8,7,8,8,9] },
  ],
  buyer: [
    { label: "30yr Rate Today",   value: "6.53%",   delta: "↓ −0.41 this week", dir: "up",   meaning: "Rates improved — monthly payment dropped ~$80.",        spark: [8,7,9,8,9,8,8,7,8,7,7,6] },
    { label: "Price Drops (7d)",  value: "847",     delta: "↑ +34 today",       dir: "up",   accent: true, meaning: "Sellers cutting — you have negotiating room.", spark: [3,3,4,5,5,5,6,7,7,8,8,9] },
    { label: "Est. Monthly Pmt",  value: "$2,614",  delta: "↓ $80 vs last mo",  dir: "up",   meaning: "Based on $400k loan at 6.53% — review affordability.", spark: [6,6,7,7,8,8,8,8,8,7,7,7] },
    { label: "Listings in Range", value: "214",     delta: "↓ −8% vs last mo",  dir: "down", meaning: "Options tightening — act on matches quickly.",           spark: [9,9,8,8,8,7,7,7,6,6,5,5] },
  ],
  seller: [
    { label: "Active Competition", value: "1,840", delta: "↓ −12% vs last mo",  dir: "down", meaning: "Fewer sellers listing — you stand out more.",     spark: [9,9,8,8,7,7,6,6,5,5,5,4] },
    { label: "Buyer Searches",     value: "↑ High", delta: "↑ 3-week trend",    dir: "up",   accent: true, meaning: "Buyers are actively searching your area.", spark: [4,5,5,6,6,7,7,8,7,8,8,9] },
    { label: "Avg Days on Market", value: "11",    delta: "↓ −3 vs last mo",    dir: "up",   meaning: "Well-priced homes sell in under 2 weeks.",          spark: [9,9,8,8,8,7,7,7,6,6,5,5] },
    { label: "List-to-Sale Ratio", value: "97.2%", delta: "↓ −0.8pt vs last",   dir: "flat", meaning: "Homes sell near ask — price right from day 1.",     spark: [9,9,9,8,8,8,8,7,7,7,8,7] },
  ],
};

export const BRIEF: Record<string, {
  changed: string; matters: string; opportunity: string; action: string;
  confidence: "High"|"Medium"|"Low"; tags: string[];
  sources: Array<{ name: string; summary: string; category: string; url: string; time: string }>
}> = {
  agent: {
    changed: "Inventory tightened for the 3rd straight week. Rate dropped 0.41% — biggest weekly move in 6 months.",
    matters: "Buyers have fewer choices, but more can now qualify with the rate dip. Sellers still hold leverage. Price drops are increasing in select submarkets.",
    opportunity: "This is prime time to contact rate-sensitive buyers who went quiet. Also pitch sellers in tight-inventory zips — they'll get strong offers.",
    action: "Send rate update to 4 waiting buyers. Review 3 price drops in Westlake matching current buyer criteria.",
    confidence: "High",
    tags: ["↑ Seller window open", "⚠ Rate sensitivity easing", "🏠 Inventory tightening"],
    sources: [
      { name: "Federal Reserve (FRED)", summary: "30yr mortgage rate fell to 6.53% — largest weekly drop since October.", category: "Rates", url: "https://fred.stlouisfed.org/series/MORTGAGE30US", time: "Today" },
      { name: "Redfin Data Center",    summary: "Austin active inventory dropped 12% vs last month — 3rd straight week.", category: "MLS", url: "https://www.redfin.com/news/data-center/market-tracker/", time: "Today" },
      { name: "Reddit r/RealEstate",   summary: "Buyers discussing rate buydowns and affordability stress. Sentiment: cautious but active.", category: "Social Sentiment", url: "https://www.reddit.com/r/RealEstate/search/?q=rate+buydown&sort=top&t=week", time: "5h ago" },
      { name: "Reuters",              summary: "Fed officials signal no rate cut until September — mortgage rates may hold near 6.5%.", category: "News", url: "https://reuters.com", time: "1h ago" },
      { name: "HousingWire",          summary: "Price drops spreading in luxury and stale listings — agents finding negotiating opportunity.", category: "News", url: "https://housingwire.com", time: "3h ago" },
      { name: "Inman News",           summary: "Post-NAR settlement: buyer agreements now required before first showing.", category: "Legal", url: "https://inman.com", time: "1d ago" },
    ],
  },
  buyer: {
    changed: "Mortgage rate dropped to 6.53% — your monthly payment just got $80 cheaper. 847 homes dropped price this week.",
    matters: "If you've been waiting on the sidelines, this is a real opening. Competition is real but manageable. Waiting for sub-6% likely means sitting through the summer rush.",
    opportunity: "Target homes listed 15+ days — sellers are motivated. Ask about rate buydowns — agents are offering them to compete.",
    action: "Review price drops in your saved search. Ask your lender about a 1-point buydown at 6.53%.",
    confidence: "High",
    tags: ["↔ Rates improving", "✅ 847 price drops", "↑ Act now vs summer rush"],
    sources: [
      { name: "Federal Reserve (FRED)", summary: "30yr rate at 6.53% — dropped 0.41% this week.", category: "Rates", url: "https://fred.stlouisfed.org/series/MORTGAGE30US", time: "Today" },
      { name: "Reddit r/FirstTimeBuyer", summary: "Buyers successfully locking rate buydowns — 1pt buydown is the move.", category: "Social Sentiment", url: "https://www.reddit.com/r/FirstTimeHomeBuyer/search/?q=buydown&sort=top&t=week", time: "5m ago" },
      { name: "Zillow Research",        summary: "Buyer demand index: 64/100 — elevated but not at peak competition.", category: "MLS", url: "https://www.zillow.com/research/", time: "8h ago" },
      { name: "HUD.gov",               summary: "Down payment assistance programs expanded — up to 120% AMI in TX and FL.", category: "News", url: "https://www.hud.gov", time: "2d ago" },
    ],
  },
  seller: {
    changed: "Inventory at its lowest since March 2024. Buyer searches are at a 3-week high. Rate dip means more buyers can qualify.",
    matters: "You have less competition than at any point last year. Buyers are searching hard but nervous about rates — they want move-in ready and will pay for it.",
    opportunity: "The June window is real. Listing now means less competition, motivated buyers, and faster close. Waiting risks the summer slowdown.",
    action: "Fix the 3 key move-in items. Price 2% under Zestimate to spark competition. List this week.",
    confidence: "High",
    tags: ["↑ Low competition now", "✅ Buyers searching", "🔑 List this week"],
    sources: [
      { name: "ACTRIS MLS",           summary: "Austin inventory down 12% vs last month — seller advantage growing.", category: "MLS", url: "https://www.redfin.com/news/data-center/market-tracker/", time: "Today" },
      { name: "Zillow Research",       summary: "Homes priced 2% below median sell 4× faster in Austin.", category: "MLS", url: "https://www.zillow.com/research/", time: "12h ago" },
      { name: "Reddit r/RealEstate",   summary: "Sellers offering buydowns get offers in days. Move-in ready is the top buyer ask.", category: "Social Sentiment", url: "https://www.reddit.com/r/RealEstate/search/?q=seller+buydown&sort=top&t=week", time: "2h ago" },
      { name: "Inman News",           summary: "Fewer sellers listing nationwide — tighter supply strengthens seller position.", category: "News", url: "https://inman.com", time: "5h ago" },
    ],
  },
};

export const BUYER_PULSE = {
  signals: [
    { label: "Buyer Urgency",        status: "High",        color: "#B4261A" },
    { label: "Rate Sensitivity",     status: "Rising",      color: "#8A5200" },
    { label: "Affordability Concern",status: "High",        color: "#B4261A" },
    { label: "Tour Intent",          status: "Medium",      color: "#0B3D91" },
    { label: "Offer Readiness",      status: "Low–Medium",  color: "#565450" },
  ],
  pains: ["Monthly payment too high", "Waiting for rates to drop", "Fear of overpaying", "Not enough inventory", "Confused: buy now vs wait?"],
};

export const CLIENT_IMPACT = [
  { group: "Waiting buyers",  signal: "Rate dropped — affordability improved",   action: "Send payment update + buydown explainer", cta: "Send message",   ctaColor: "#F57F2E" },
  { group: "Active buyers",   signal: "3 price drops match saved searches",       action: "Send matched listings immediately",        cta: "View matches",   ctaColor: "#0B5D3B" },
  { group: "Seller leads",    signal: "Inventory tightening — window is open",    action: "Pitch listing timing this week",           cta: "Create pitch",   ctaColor: "#0B3D91" },
  { group: "Cold leads",      signal: "Buyer fear + confusion rising on Reddit",  action: "Send education content on rates/buying",  cta: "Create post",    ctaColor: "#565450" },
];

export const SELLER_OPP = [
  { area: "Westlake Hills",  signal: "Inventory down, demand high",     dom: "9 days",  action: "Contact seller leads",       urgency: "hot"  },
  { area: "78704 (Bouldin)", signal: "Price drops matching buyers",     dom: "14 days", action: "Review comps + pitch",       urgency: "hot"  },
  { area: "Round Rock",      signal: "DOM rising — pricing issue",      dom: "28 days", action: "Recommend price strategy",   urgency: "warm" },
  { area: "Pflugerville",    signal: "New listings incoming next week",  dom: "18 days", action: "Prepare buyer shortlists",   urgency: "warm" },
];

export const ACTIONS: Record<string, Array<{ text: string; reason: string; cta: string }>> = {
  agent: [
    { text: "Send rate update to 4 waiting buyers",     reason: "Rate dropped 0.41% — biggest move in 6 months.",         cta: "Send message" },
    { text: "Review 3 price drops matching clients",    reason: "2 buyers saved similar homes last week.",                 cta: "View matches" },
    { text: "Pitch listing window to seller pipeline",  reason: "Inventory at 3-year low — seller leverage returning.",    cta: "Create pitch" },
    { text: "Engage Reddit threads in your zip",        reason: "Buyer fear rising — education content converts leads.",   cta: "View threads" },
  ],
  buyer: [
    { text: "Review new price drops in saved search",   reason: "34 homes cut price today in your target area.",          cta: "View listings" },
    { text: "Ask lender about 1pt rate buydown",        reason: "Buydowns are working — top Reddit strategy this week.",  cta: "Contact lender" },
    { text: "Schedule tours for 3 matched homes",       reason: "Inventory tightening — good homes moving fast.",         cta: "Schedule tours" },
    { text: "Read: buy now vs wait for lower rates",    reason: "Waiting for sub-6% may mean missing summer inventory.", cta: "Read article" },
  ],
  seller: [
    { text: "Fix top 3 items — buyers want move-in ready", reason: "Move-in ready sells 22% faster per Redfin.",            cta: "See checklist" },
    { text: "Price 2% below comp to spark competition",    reason: "Homes priced this way sell 4× faster in Austin.",      cta: "Run comps" },
    { text: "List this week — catch June buyer wave",       reason: "June historically peaks, July slows. Window is now.",  cta: "Talk to agent" },
    { text: "Offer 1pt rate buydown in listing",           reason: "Top buyer ask on Reddit this week — wins offers.",     cta: "Add to listing" },
  ],
};

export const SIGNALS_STATIC: Record<string, Array<{ src: string; c: string; bg: string; text: string; sub: string; t: string; url: string; tab: SigTab; agentUse: string }>> = {
  agent: [
    { src:"Reddit", c:"#FF4500", bg:"#FFF2EC", tab:"Pain",   text:'"Rates feel impossible — anyone getting buydowns under 5%?"',              sub:"r/FirstTimeHomeBuyer · 847 upvotes", t:"2m",  url:"https://www.reddit.com/r/FirstTimeHomeBuyer/search/?q=buydown&sort=top&t=week", agentUse:"Send buydown explainer to rate-sensitive clients." },
    { src:"FRED",   c:"#0B3D91", bg:"#EAF0FF", tab:"Rates",  text:"2 FOMC officials signal June rate hold — no cut until September",            sub:"Reuters · Federal Reserve",         t:"1h",  url:"https://fred.stlouisfed.org/series/MORTGAGE30US", agentUse:"Advise clients rates will hold — lock now vs wait." },
    { src:"Market", c:"#2D6A4F", bg:"#E6F4EC", tab:"Market", text:"Austin inventory drops 3rd consecutive week — Board of Realtors",            sub:"Austin MLS · ACTRIS data",          t:"3h",  url:"https://www.redfin.com/news/data-center/market-tracker/", agentUse:"Pitch seller leads — limited competition right now." },
    { src:"Trends", c:"#0F141A", bg:"#F0F0F0", tab:"Trends", text:'"Toured 8 homes. Nothing under $450k has a garage in Austin anymore"',      sub:"Trending · Buyers",                 t:"20m", url:"https://x.com/search?q=austin+homes+garage&src=typed_query", agentUse:"Address garage availability early in buyer consultations." },
    { src:"Market", c:"#CC0000", bg:"#FDECEC", tab:"Market", text:"Barton Hills median price +3.2% in 30 days vs Austin avg +0.4%",             sub:"redfin.com market data",            t:"6h",  url:"https://www.redfin.com/news/data-center/market-tracker/", agentUse:"Highlight Barton Hills appreciation to buyer clients." },
    { src:"News",   c:"#555555", bg:"#F5F5F3", tab:"News",   text:"NAR: buyer-agent agreements now required before first showing in most states", sub:"Inman News",                        t:"1d",  url:"https://inman.com", agentUse:"Update your intake forms — compliance required now." },
  ],
  buyer: [
    { src:"Reddit", c:"#FF4500", bg:"#FFF2EC", tab:"Pain",   text:'"Locked at 6.5% with a 1pt buydown — absolutely worth it"',          sub:"r/FirstTimeHomeBuyer · 1.2k", t:"5m",  url:"https://www.reddit.com/r/FirstTimeHomeBuyer/search/?q=buydown+locked&sort=top&t=week", agentUse:"" },
    { src:"FRED",   c:"#0B3D91", bg:"#EAF0FF", tab:"Rates",  text:"Fed holds — analysts say earliest cut is now September 2026",         sub:"Wall Street Journal",         t:"1h",  url:"https://fred.stlouisfed.org/series/MORTGAGE30US", agentUse:"" },
    { src:"News",   c:"#555555", bg:"#F5F5F3", tab:"News",   text:"Affordability improves slightly as sellers compete for fewer buyers",  sub:"Bloomberg",                   t:"2h",  url:"https://fortune.com/2026/05/26/home-prices-falling-la-dallas-housing-market-sun-belt/", agentUse:"" },
    { src:"Market", c:"#006AFF", bg:"#EAF0FF", tab:"Market", text:"Buyer demand index: 64/100 in Austin — elevated but not peak",        sub:"zillow.com/research",         t:"8h",  url:"https://www.zillow.com/research/", agentUse:"" },
    { src:"Trends", c:"#FF4500", bg:"#FFF2EC", tab:"Trends", text:'"Is now actually a good time to buy? Breaking down the math..."',    sub:"Trending · Buyers",           t:"3h",  url:"https://www.reddit.com/r/personalfinance/search/?q=good+time+buy+home+2026&sort=top&t=month", agentUse:"" },
    { src:"News",   c:"#2D6A4F", bg:"#E6F4EC", tab:"News",   text:"Down payment assistance expanded in TX and FL — 120% AMI eligible",  sub:"HUD.gov",                     t:"2d",  url:"https://www.hud.gov", agentUse:"" },
  ],
  seller: [
    { src:"Trends", c:"#FF4500", bg:"#FFF2EC", tab:"Trends", text:'"Sellers offering buydowns get offers in days, not weeks"',            sub:"Trending · Sellers",          t:"2h",  url:"https://www.reddit.com/r/FirstTimeHomeBuyer/search/?q=seller+buydown&sort=top&t=week", agentUse:"" },
    { src:"Market", c:"#2D6A4F", bg:"#E6F4EC", tab:"Market", text:"Avg seller concession in Austin metro: $8,400 this quarter",          sub:"ACTRIS MLS data",             t:"8h",  url:"https://www.redfin.com/news/data-center/market-tracker/", agentUse:"" },
    { src:"News",   c:"#555555", bg:"#F5F5F3", tab:"News",   text:"Fewer sellers listing = tighter supply = stronger position",           sub:"Inman News",                  t:"5h",  url:"https://inman.com", agentUse:"" },
    { src:"Market", c:"#006AFF", bg:"#EAF0FF", tab:"Market", text:"Homes priced 2% below median sell 4× faster in Austin metro",         sub:"zillow.com/research",         t:"12h", url:"https://www.zillow.com/research/", agentUse:"" },
    { src:"Trends", c:"#0F141A", bg:"#F0F0F0", tab:"Trends", text:'"Open house in Bouldin was PACKED. Multiple offers by Sunday"',        sub:"Trending · Market",           t:"3h",  url:"https://x.com/search?q=open+house+multiple+offers+austin", agentUse:"" },
    { src:"News",   c:"#555555", bg:"#F5F5F3", tab:"News",   text:"Move-in ready homes sell 22% faster — Redfin research",               sub:"redfin.com research",         t:"1d",  url:"https://www.redfin.com/news/data-center/market-tracker/", agentUse:"" },
  ],
};

export const PAIN_OPTS: Record<string, {label:string;icon:string}[]> = {
  agent:  [{label:"Unqualified leads",icon:"⏰"},{label:"AI threatening fees",icon:"🤖"},{label:"Commission pushback",icon:"💸"},{label:"Seller overpricing",icon:"📊"},{label:"Financing fallthrough",icon:"🏦"},{label:"Market confusing",icon:"❓"}],
  buyer:  [{label:"Can't win bidding wars",icon:"⚔️"},{label:"Rates too high",icon:"💰"},{label:"Can't find right home",icon:"🔍"},{label:"Down payment large",icon:"🏦"},{label:"Agent not helping",icon:"😤"},{label:"Process confusing",icon:"❓"}],
  seller: [{label:"Home sitting long",icon:"🏠"},{label:"Buyers backing out",icon:"❌"},{label:"Appraisal low",icon:"📉"},{label:"Agent not communicating",icon:"📵"},{label:"Unsure when to list",icon:"📅"},{label:"Pricing uncertainty",icon:"❓"}],
};

export const PAIN_ANSWERS: Record<string,string> = {
  "Can't win bidding wars": "1,247 buyers face this weekly. Top tactic: escalation clause + personal letter + flexible close. Works 34% of the time on multiple offers.",
  "Rates too high": "At 6.53%, $400k loan = $2,614/mo. Buyers locking now — waiting for sub-6% may take 18+ months per Fed signals.",
  "Home sitting long": "Homes 30+ days sell 3–5% less than if priced right day 1. Price reduction in week 2 outperforms waiting to week 6.",
  "Unqualified leads": "Top qualifier: pre-approval + specific city + specific budget + 90-day timeline. Any missing = nurture only.",
  "Commission pushback": "Show ROI data: homes with agents sell 6% more on average. Written value statement before every listing prevents pushback.",
};

export const TYPE_KEYWORDS: Record<string, string[]> = {
  rate_alert:      ["Rate Alert", "Mortgage Rate", "Rate Drop"],
  buyer_pain:      ["Buyer Pain", "Buyer"],
  market_update:   ["Market Update", "Market"],
  market_pulse:    ["Market Pulse"],
  seller_alert:    ["Seller Alert", "Seller"],
  news_flash:      ["News Flash", "News"],
  hot_market:      ["Hot Market", "On Fire"],
  buyer_tip:       ["Buyer Tip", "Buying Tips", "Home Buying", "Buy Smart"],
  investment_tip:  ["Investment"],
  affordability:   ["Afford"],
  agent_insight:   ["Agent"],
};
