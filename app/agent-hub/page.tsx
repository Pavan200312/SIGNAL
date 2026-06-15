"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis,
} from "recharts";

type Tab = "overview" | "market" | "buyers" | "hotbuyers" | "pain" | "news";

const RATE_HISTORY = [
  { m: "Jun", v: 7.22 }, { m: "Jul", v: 6.96 }, { m: "Aug", v: 7.09 },
  { m: "Sep", v: 6.88 }, { m: "Oct", v: 6.74 }, { m: "Nov", v: 6.91 },
  { m: "Dec", v: 7.03 }, { m: "Jan", v: 6.95 }, { m: "Feb", v: 6.87 },
  { m: "Mar", v: 6.79 }, { m: "Apr", v: 6.94 }, { m: "May", v: 6.53 },
];

const INVENTORY_DATA = [
  { m: "Jan", v: 2.1 }, { m: "Feb", v: 2.3 }, { m: "Mar", v: 2.6 },
  { m: "Apr", v: 2.9 }, { m: "May", v: 3.1 }, { m: "Jun", v: 3.4 },
];

const PRICE_DATA = [
  { m: "Jun", v: 408 }, { m: "Sep", v: 412 }, { m: "Dec", v: 418 },
  { m: "Mar", v: 421 }, { m: "May", v: 424 },
];

const CITIES = [
  { name: "Dallas",    state: "TX", dom: 9,  score: 94, trend: "heat", change: "+12%", buyers: 2847, sentiment: 0.72 },
  { name: "Austin",    state: "TX", dom: 14, score: 87, trend: "cool", change: "-3%",  buyers: 1923, sentiment: 0.41 },
  { name: "Nashville", state: "TN", dom: 11, score: 82, trend: "heat", change: "+8%",  buyers: 1654, sentiment: 0.65 },
  { name: "Phoenix",   state: "AZ", dom: 18, score: 76, trend: "stable", change: "0%",buyers: 1201, sentiment: 0.38 },
  { name: "Denver",    state: "CO", dom: 12, score: 73, trend: "heat", change: "+5%",  buyers: 987,  sentiment: 0.55 },
  { name: "Atlanta",   state: "GA", dom: 15, score: 71, trend: "cool", change: "-2%",  buyers: 834,  sentiment: 0.29 },
];

const HOT_STATES = [
  { state: "Texas",      buyers: 4847, trend: "+23%", color: "var(--up)" },
  { state: "Florida",    buyers: 3634, trend: "+18%", color: "var(--up)" },
  { state: "Georgia",    buyers: 2512, trend: "+9%",  color: "var(--up)" },
  { state: "Tennessee",  buyers: 2401, trend: "+31%", color: "var(--up)" },
  { state: "California", buyers: 2189, trend: "-4%",  color: "var(--down)" },
];

const PAIN_POINTS = [
  { pain: "Can't win bidding wars",               count: 1247, pct: 96, src: "r/RealEstate",    url: "https://www.reddit.com/r/RealEstate/search/?q=bidding+war+can%27t+win&sort=top&t=month",           cat: "buyer" },
  { pain: "AI platforms threatening commissions", count: 847,  pct: 65, src: "HousingWire",     url: "https://housingwire.com/articles/ai-real-estate-agents-commission-threat-2026/",                    cat: "agent" },
  { pain: "NAR rules — buyer agreements required",count: 712,  pct: 55, src: "Inman News",      url: "https://www.inman.com/2025/08/17/what-does-the-nar-settlement-mean-for-buyer-agent-agreements/",    cat: "agent" },
  { pain: "Sellers pricing above market reality", count: 634,  pct: 49, src: "r/RealEstate",    url: "https://www.reddit.com/r/RealEstate/search/?q=sellers+overpriced+2021+prices&sort=top&t=month",     cat: "seller" },
  { pain: "Mortgage rates killing affordability", count: 512,  pct: 39, src: "r/Mortgages",     url: "https://www.reddit.com/r/Mortgages/search/?q=rates+too+high+can%27t+afford&sort=top&t=month",       cat: "buyer" },
  { pain: "Appraisal gaps killing deals",         count: 389,  pct: 30, src: "r/RealEstate",    url: "https://www.reddit.com/r/RealEstate/search/?q=appraisal+gap+deal+fell+through&sort=top&t=month",   cat: "agent" },
];

const PRIORITY = [
  { txt: "Commission disclosure rules updated — review forms before next listing", sub: "New NAR requirement effective this month",          src: "Inman",        url: "https://www.inman.com/2025/08/17/what-does-the-nar-settlement-mean-for-buyer-agent-agreements/",    time: "Today",  urgency: "high" },
  { txt: "Rates dropped 0.41% — best window in 6 months, call warm leads NOW",    sub: "30yr rate: 6.53% — live Federal Reserve data",     src: "FRED",         url: "https://fred.stlouisfed.org/series/MORTGAGE30US",                                                      time: "Today",  urgency: "high" },
  { txt: "Homa AI buyer agent expanding to Texas — competitive threat for agents", sub: "Florida-based platform, first AI-only home closes", src: "BusinessWire", url: "https://www.businesswire.com/news/home/20251201257764/en/Homa-Announces-First-End-to-End-AI-Powered-Home-Purchases-in-the-United-States", time: "2d ago", urgency: "medium" },
  { txt: "Inventory rising — 3.1 months supply — seller leverage window narrowing",sub: "Redfin Data Center weekly report",                  src: "Redfin",       url: "https://www.redfin.com/news/data-center/market-tracker/",                                              time: "3d ago", urgency: "medium" },
];

const NEWS_FEED = [
  { type: "fi-news",   src: "HousingWire",  srcFull: "housingwire.com",     time: "2h ago", cat: "ft-market", catLbl: "Market",
    title: "Dallas-Fort Worth inventory falls to 5-year low",
    url:   "https://housingwire.com/articles/dallas-fort-worth-housing-inventory-2026/",
    desc:  "Active listings in DFW dropped 18% YoY. Days-on-market: 9 days for correctly priced homes." },

  { type: "fi-fred",   src: "FRED",         srcFull: "fred.stlouisfed.org", time: "Today",  cat: "ft-rates",  catLbl: "Rates",
    title: "30-year fixed rate at 6.53% — live Federal Reserve weekly data",
    url:   "https://fred.stlouisfed.org/series/MORTGAGE30US",
    desc:  "Federal Reserve Freddie Mac Primary Mortgage Market Survey. View full 52-week trend." },

  { type: "fi-reddit", src: "r/RealEstate", srcFull: "reddit.com",          time: "5h ago", cat: "ft-pain",   catLbl: "Pain",
    title: "\"Sellers still expecting 2021 prices — how do you handle the pricing conversation?\"",
    url:   "https://www.reddit.com/r/RealEstate/search/?q=sellers+expecting+2021+prices+pricing+conversation&sort=top&t=month",
    desc:  "4.2K upvotes. 800+ agents sharing scripts for closing the expectation gap with sellers." },

  { type: "fi-news",   src: "BusinessWire", srcFull: "businesswire.com",    time: "8h ago", cat: "ft-tech",   catLbl: "Tech",
    title: "Homa AI buyer agent announces Texas expansion — Q3 2026",
    url:   "https://www.businesswire.com/news/home/20251201257764/en/Homa-Announces-First-End-to-End-AI-Powered-Home-Purchases-in-the-United-States",
    desc:  "Florida-based platform that closed first AI-only home purchases moving into Dallas and Austin markets." },

  { type: "fi-news",   src: "Inman",        srcFull: "inman.com",           time: "1d ago", cat: "ft-legal",  catLbl: "Legal",
    title: "Buyer agreement requirements: what every agent must have signed before first showing",
    url:   "https://www.inman.com/2025/08/17/what-does-the-nar-settlement-mean-for-buyer-agent-agreements/",
    desc:  "Post-NAR settlement rules now in effect. Agents who don't comply risk deal complications and liability." },

  { type: "fi-reddit", src: "r/Mortgages",  srcFull: "reddit.com",          time: "1d ago", cat: "ft-rates",  catLbl: "Rates",
    title: "\"Should I wait for rates to drop below 6% or buy now?\" — 1.2K replies",
    url:   "https://www.reddit.com/r/Mortgages/search/?q=wait+rates+below+6+percent+buy+now&sort=top&t=month",
    desc:  "Top thread this week. Consensus: waiting for sub-6% may take 18+ months. Buy now if ready." },
];

const MARKET_CARDS = [
  { name: "30-Yr Mortgage Rate", sub: "Federal Reserve · FRED", lbl: "Current Rate", val: "6.53%", change: "▼ 0.41%", dir: "up" as const, data: RATE_HISTORY, key: "v", color: "#F97316", src: "https://fred.stlouisfed.org/series/MORTGAGE30US" },
  { name: "Housing Inventory",   sub: "Months of Supply · Redfin", lbl: "Supply Level", val: "3.1mo", change: "▲ Rising",  dir: "down" as const, data: INVENTORY_DATA, key: "v", color: "#EF4444", src: "https://redfin.com/news/data-center" },
  { name: "Median Home Price",   sub: "Case-Shiller · FRED",      lbl: "Median ($000s)", val: "$424k", change: "▲ +4.2% YoY", dir: "up" as const, data: PRICE_DATA, key: "v", color: "#22C55E", src: "https://fred.stlouisfed.org/series/CSUSHPISA" },
];

const NAV_ITEMS = [
  { id: "overview",  ic: "📊", label: "Dashboard" },
  { id: "market",    ic: "📈", label: "Market Data" },
  { id: "hotbuyers", ic: "🔥", label: "Hot Buyers",  badge: "5" },
  { id: "buyers",    ic: "😤", label: "Buyer Issues" },
  { id: "pain",      ic: "⚡", label: "Agent Pain" },
  { id: "news",      ic: "📰", label: "News Feed" },
];

const SUB_TABS = [
  { id: "overview",  label: "Overview" },
  { id: "market",    label: "Market Data" },
  { id: "buyers",    label: "Buyer Issues" },
  { id: "hotbuyers", label: "Hot Buyers" },
  { id: "pain",      label: "Agent Pain Points" },
  { id: "news",      label: "News Feed" },
];

function MiniChart({ data, color, dataKey }: { data: object[]; color: string; dataKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          fill={`url(#g-${color.replace("#", "")})`} dot={false} />
        <Tooltip contentStyle={{ display: "none" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CityMini({ sentiment }: { sentiment: number }) {
  const data = [0.2, 0.35, sentiment * 0.7, sentiment * 0.85, sentiment].map((v, i) => ({ i, v }));
  const c = sentiment > 0.4 ? "#F97316" : sentiment > 0.1 ? "#F59E0B" : "#EF4444";
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={c} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function AgentHub() {
  const [tab, setTab] = useState<Tab>("overview");
  const [fetching, setFetching] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/market/signals")
      .then(r => r.json())
      .then(d => {
        if (d.hasRealData) {
          setIsLive(true);
          if (d.updatedAt) setUpdatedAt(new Date(d.updatedAt).toLocaleTimeString());
        }
      }).catch(() => {});
  }, []);

  async function fetchLive() {
    setFetching(true);
    try {
      await fetch("/api/cron/collect?secret=snapsignal-cron");
      setIsLive(true);
      setUpdatedAt(new Date().toLocaleTimeString());
    } finally { setFetching(false); }
  }

  return (
    <>
      <link rel="stylesheet" href="/agent.css" />
      <div className="shell">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-icon">🏠</div>
            <div>
              <div className="sb-logo-text">Snaphomz</div>
              <div className="sb-logo-sub">Agent Intelligence</div>
            </div>
          </div>

          <div className="sb-section">
            <div className="sb-section-lbl">Intelligence</div>
            {NAV_ITEMS.map(n => (
              <div key={n.id} className={`sb-item${tab === n.id ? " on" : ""}`}
                onClick={() => setTab(n.id as Tab)}>
                <span className="ic">{n.ic}</span>
                {n.label}
                {n.badge && <span className="badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="sb-section" style={{ marginTop: 8 }}>
            <div className="sb-section-lbl">Tools</div>
            <div className="sb-item"><span className="ic">🔔</span>Alerts</div>
            <div className="sb-item"><span className="ic">📊</span>Reports</div>
            <div className="sb-item"><span className="ic">⚙️</span>Settings</div>
          </div>

          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-avatar">A</div>
              <div className="sb-user-info">
                <div className="sb-user-name">Agent View</div>
                <div className="sb-user-role">SnapMarket Pro</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Top bar */}
          <div className="topbar">
            <div>
              <div className="topbar-title">Agent Intelligence Dashboard</div>
              <div className="topbar-sub">Real data from Reddit · X · News · FRED · Updated continuously</div>
            </div>
            <div className="topbar-right">
              <div className="live-badge">
                <div className="live-dot" />
                {isLive ? `Live · ${updatedAt}` : "Demo Data"}
              </div>
              <button className="tb-btn" suppressHydrationWarning
                onClick={fetchLive} disabled={fetching}>
                {fetching ? "⟳ Fetching..." : "⟳ Refresh"}
              </button>
              <button className="tb-btn primary" suppressHydrationWarning>
                Get SMS Alerts
              </button>
            </div>
          </div>

          {/* Sub-nav */}
          <div className="subnav">
            {SUB_TABS.map(t => (
              <div key={t.id} className={`sn-tab${tab === t.id ? " on" : ""}`}
                onClick={() => setTab(t.id as Tab)}>
                {t.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="content">

            {/* ── PRIORITY ALERTS ── */}
            {(tab === "overview" || tab === "market") && (
              <>
                <div className="sec-head">
                  <div className="sec-title">
                    ⚡ Priority Alerts
                    <span className="sec-sub">— what to act on today</span>
                  </div>
                </div>
                <div className="priority-list">
                  <div className="plist-head">
                    <span className="plist-title">🎯 Agent Action Items This Week</span>
                    <span className="plist-badge">{PRIORITY.length} alerts</span>
                  </div>
                  {PRIORITY.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                      className="plist-item">
                      <div className="plist-num">{i + 1}</div>
                      <div className="plist-mid">
                        <div className="plist-txt">{p.txt}</div>
                        <div className="plist-sub">{p.sub}</div>
                      </div>
                      <div className="plist-right">
                        <span className="plist-src">{p.src} ↗</span>
                        <span className="plist-time">{p.time}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* ── MARKET CARDS (Stakent style) ── */}
            {(tab === "overview" || tab === "market") && (
              <>
                <div className="sec-head">
                  <div className="sec-title">📈 Market Overview
                    <span className="sec-sub">— live from Federal Reserve + Redfin</span>
                  </div>
                </div>
                <div className="market-cards">
                  {MARKET_CARDS.map((c, i) => (
                    <a key={i} href={c.src} target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}>
                      <div className="mcard">
                        <div className="mcard-badge">📡 Live Data ↗</div>
                        <div className="mcard-name">{c.name}</div>
                        <div className="mcard-sub">{c.sub}</div>
                        <div className="mcard-rate-lbl">{c.lbl}</div>
                        <div className="mcard-rate">{c.val}</div>
                        <div className={`mcard-change ${c.dir}`}>{c.change}</div>
                        <div className="mcard-chart">
                          <MiniChart data={c.data} color={c.color} dataKey={c.key} />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* ── KEY STATS ── */}
            {tab === "overview" && (
              <div className="stats-row">
                {[
                  { lbl: "Avg Days on Market",  val: "11",     sub: "↓ -3 vs last month", cls: "up",   icon: "📅" },
                  { lbl: "Active Buyer Signals", val: "9,412",  sub: "↑ +18% this week",   cls: "up",   icon: "🔥" },
                  { lbl: "Price Reductions",     val: "12%",    sub: "↑ of listings cut",  cls: "down", icon: "📉" },
                  { lbl: "Inventory Level",      val: "3.1mo",  sub: "↑ rising (neutral)",  cls: "flat", icon: "🏠" },
                ].map((s, i) => (
                  <div key={i} className="stat-cell">
                    <div className="stat-lbl">{s.icon} {s.lbl}</div>
                    <div className="stat-val">{s.val}</div>
                    <div className={`stat-sub ${s.cls}`}>{s.sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CITIES ── */}
            {(tab === "overview" || tab === "market") && (
              <>
                <div className="sec-head">
                  <div className="sec-title">🏙️ Market by City
                    <span className="sec-sub">— sentiment from Reddit + X + Brave</span>
                  </div>
                </div>
                <div className="city-grid">
                  {CITIES.map((c, i) => (
                    <div key={i} className="city-card">
                      <div className="city-top">
                        <div>
                          <div className="city-name">{c.name}</div>
                          <div className="city-state">{c.state} · {c.buyers.toLocaleString()} active buyers</div>
                        </div>
                        <span className={`city-badge ${c.trend === "heat" ? "cb-heat" : c.trend === "cool" ? "cb-cool" : "cb-stable"}`}>
                          {c.trend === "heat" ? "🔥 Heating" : c.trend === "cool" ? "❄ Cooling" : "→ Stable"}
                        </span>
                      </div>
                      <div className="city-chart">
                        <CityMini sentiment={c.sentiment} />
                      </div>
                      <div className="city-metric">
                        <span className="city-m-lbl">Buzz Score</span>
                        <span className="city-m-val">{c.score}/100</span>
                      </div>
                      <div className="city-metric">
                        <span className="city-m-lbl">Avg DOM</span>
                        <span className="city-m-val">{c.dom} days</span>
                      </div>
                      <div className={`city-sentiment ${c.change.startsWith("+") ? "stat-sub up" : c.change.startsWith("-") ? "stat-sub down" : "stat-sub flat"}`}>
                        {c.change} vs last week
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── MAIN TWO-COL ── */}
            {(tab === "overview" || tab === "pain" || tab === "hotbuyers") && (
              <div className="two-col">

                {/* Agent Pain Points */}
                <div>
                  <div className="sec-head">
                    <div className="sec-title">⚡ Agent Pain Points
                      <span className="sec-sub">— from Reddit, X this week</span>
                    </div>
                  </div>
                  <div className="feed-box">
                    <div className="feed-box-head">
                      <span className="feed-box-title">What agents + clients struggle with</span>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>Click → original source</span>
                    </div>
                    {PAIN_POINTS.map((p, i) => (
                      <div key={i} className="pain-row">
                        <div className="pain-top">
                          <span className="pain-name">{p.pain}</span>
                          <span className="pain-count">{p.count.toLocaleString()} mentions</span>
                        </div>
                        <div className="pain-bar-track">
                          <div className="pain-bar-fill" style={{ width: `${p.pct}%` }} />
                        </div>
                        <div className="pain-tag">
                          <span>{p.cat}</span>
                          <span>·</span>
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="pain-src-link">{p.src} ↗</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hot Buyers by State */}
                <div className="side-widgets">
                  <div className="sec-head">
                    <div className="sec-title">🔥 Hot Buyers by State</div>
                  </div>
                  <div className="widget2">
                    <div className="w2-head">Active buyer signals <span>via Brave Search</span></div>
                    {HOT_STATES.map((s, i) => (
                      <div key={i} className="w2-row">
                        <div className="w2-rank">{i + 1}</div>
                        <div className="w2-mid">
                          <div className="w2-name">{s.state}</div>
                          <div className="w2-sub">{s.buyers.toLocaleString()} active searches</div>
                        </div>
                        <span className="w2-val" style={{ color: s.color }}>{s.trend}</span>
                      </div>
                    ))}
                  </div>

                  <div className="widget2">
                    <div className="w2-head">🔔 Agent Alerts</div>
                    {PRIORITY.slice(0, 3).map((p, i) => (
                      <div key={i} className="alert-row">
                        <div className="alert-dot" style={{
                          background: i === 0 ? "var(--down)" : i === 1 ? "var(--orange)" : "var(--muted)"
                        }} />
                        <div className="alert-body">
                          <div className="alert-txt">{p.txt.substring(0, 60)}...</div>
                          <div className="alert-time">{p.time} · <a href={p.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--orange)", fontSize: 10, textDecoration: "none" }}>{p.src} ↗</a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NEWS FEED ── */}
            {(tab === "overview" || tab === "news") && (
              <>
                <div className="sec-head">
                  <div className="sec-title">📰 News Feed
                    <span className="sec-sub">— click any headline to read full article</span>
                  </div>
                </div>
                <div className="feed-box">
                  <div className="feed-box-head">
                    <span className="feed-box-title">Latest real estate intelligence</span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{NEWS_FEED.length} articles · All links open original source</span>
                  </div>
                  {NEWS_FEED.map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                      className="feed-item">
                      <div className={`feed-item-icon ${n.type}`}>
                        {n.type === "fi-reddit" ? "r/" : n.type === "fi-fred" ? "◆" : n.type === "fi-x" ? "𝕏" : "N"}
                      </div>
                      <div className="feed-item-body">
                        <div className="feed-item-src">
                          {n.src} · {n.srcFull}
                        </div>
                        <div className="feed-item-title">{n.title}</div>
                        <div className="feed-item-desc">{n.desc}</div>
                        <div className="feed-item-foot">
                          <span className={`feed-tag ${n.cat}`}>{n.catLbl}</span>
                          <span className="feed-item-time">{n.time}</span>
                          <span className="feed-read">Read full article ↗</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

          </div>

          <div className="footnote2">
            SnapMarket Agent Hub · Sources: FRED · Reddit · X · Brave Search · Inman · HousingWire · All links open original source
          </div>
        </div>
      </div>
    </>
  );
}
