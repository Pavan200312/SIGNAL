"use client";

import { useState, useEffect } from "react";

type Role = "agent" | "seller" | "buyer";
type Pill = "all" | "news" | "rates" | "pricecuts" | "buyerpain" | "sellerpain" | "tech" | "legal" | "subs" | "social";

const PILLS: { id: Pill; label: string; dot: string }[] = [
  { id: "all",        label: "All",           dot: "#7FAAFF" },
  { id: "news",       label: "🔥 Hot News",   dot: "#FF4D5E" },
  { id: "rates",      label: "💰 Rates",      dot: "#FF7A3D" },
  { id: "pricecuts",  label: "📉 Price Cuts", dot: "#F5B83D" },
  { id: "buyerpain",  label: "😤 Buyer Pain", dot: "#00CFA8" },
  { id: "sellerpain", label: "🏷️ Seller Pain",dot: "#FF7A3D" },
  { id: "tech",       label: "🤖 Tech & AI",  dot: "#3D7DFF" },
  { id: "legal",      label: "⚖️ Legal",      dot: "#9B6BFF" },
  { id: "subs",       label: "🏘️ Subdivisions",dot: "#F5B83D" },
  { id: "social",     label: "💬 Social Buzz",dot: "#FF5C9D" },
];

interface Signal {
  cats: string[];
  src: string;
  srcName: string;
  badge: [string, string];
  title: string;
  why: string;
  score: number;
  scoreLbl: string;
  actions: Record<Role, string>;
  stats: [string, string][];
  time: string;
  url?: string;
}

// Demo signals — shown when no pipeline data
const DEMO_SIGNALS: Signal[] = [
  {
    cats: ["all", "rates"], src: "data", srcName: "FRED · Federal Reserve",
    badge: ["b-trend", "📊 Live"], url: "https://fred.stlouisfed.org",
    title: "30-year mortgage rate holding at 6.82% — above 6% through 2026",
    why: "Rates aren't falling to the 5% range buyers hoped for. Affordability stays tight but stable — buyers can plan with more confidence than 2023.",
    score: 84, scoreLbl: "Rising", time: "Updated today",
    actions: { buyer: "Lock now if you find the right home.", seller: "Price for payment not price.", agent: "Lead with monthly cost, not list price." },
    stats: [["📊", "Federal Reserve data"]]
  },
  {
    cats: ["all", "news", "pricecuts", "sellerpain"], src: "news", srcName: "Realtor.com",
    badge: ["b-hot", "🔥 Hot"], url: "https://realtor.com",
    title: "Builders cutting prices and offering incentives to move new-construction inventory",
    why: "Builders sitting on completed homes are far more willing to deal than individual sellers — creating a two-speed market.",
    score: 79, scoreLbl: "Rising fast", time: "1d ago",
    actions: { buyer: "Target builder inventory — ask for rate buydowns.", seller: "Compete with a seller credit, not a price drop.", agent: "Map builder incentives in your zip." },
    stats: [["💬", "1.4K reads"]]
  },
  {
    cats: ["all", "social", "sellerpain", "buyerpain"], src: "reddit", srcName: "r/RealEstate · 4.2K upvotes",
    badge: ["b-pain", "😤 Pain"], url: "https://reddit.com/r/RealEstate",
    title: "\"Sellers still expecting 2021 prices — how do agents handle the pricing conversation?\"",
    why: "Top thread this week. 800+ agents sharing scripts for the gap between seller expectations and a flat-price market.",
    score: 82, scoreLbl: "Very high", time: "5h ago",
    actions: { buyer: "Overpriced listings that linger are your negotiation opening.", seller: "Your home's value is what today's buyers pay, not 2021 peak.", agent: "Use the 'price it right' data story — first 2 weeks get most views." },
    stats: [["⬆", "4.2K upvotes"], ["💬", "800+ replies"]]
  },
  {
    cats: ["all", "tech", "news"], src: "x", srcName: "X · PropTech",
    badge: ["b-tech", "🤖 Tech"], url: "https://x.com/search?q=proptech+real+estate+AI",
    title: "AI valuation tools gaining traction — agents split on whether they help or threaten CMAs",
    why: "Adoption of AI listing and valuation tools is climbing. Some see efficiency gains; others worry about commoditizing pricing expertise.",
    score: 71, scoreLbl: "Rising", time: "8h ago",
    actions: { buyer: "Use AI estimates as a starting point, not gospel.", seller: "Local agent CMA still reads the micro-market best.", agent: "Adopt AI for speed — lead with local insight algorithms can't replicate." },
    stats: [["🔁", "2.1K reposts"]]
  },
  {
    cats: ["all", "legal", "news"], src: "news", srcName: "HousingWire",
    badge: ["b-pain", "⚖️ Legal"], url: "https://housingwire.com",
    title: "Buyer-agent commission changes reshaping how fees are negotiated nationwide",
    why: "Post-NAR settlement, buyers can negotiate buyer-agent fees more directly. Confusion persists about who pays what.",
    score: 88, scoreLbl: "Very high", time: "2h ago",
    actions: { buyer: "You can negotiate buyer-agent fees — ask about value upfront.", seller: "Clarify fee structure before listing — affects net proceeds.", agent: "A clear written value proposition prevents fee pushback." },
    stats: [["💬", "3.2K comments"]]
  },
  {
    cats: ["all", "subs", "news"], src: "news", srcName: "Local Development",
    badge: ["b-new", "🏘️ New"], url: "https://housingwire.com",
    title: "New master-planned communities breaking ground in Sun Belt — Phase 1 lots filling fast",
    why: "Builder activity concentrated in high-migration Sun Belt metros. New supply gives buyers options but competes with nearby resales.",
    score: 64, scoreLbl: "Steady", time: "2d ago",
    actions: { buyer: "New communities often bundle incentives — compare total cost vs resales.", seller: "New community nearby? Expect more price pressure — act sooner.", agent: "Build relationships with builder reps — steady buyer leads." },
    stats: [["🏗️", "4,200+ lots"]]
  },
];

const SRC_STYLE: Record<string, [string, string]> = {
  reddit: ["s-reddit", "r/"],
  x:      ["s-x",      "𝕏"],
  news:   ["s-news",   "N"],
  insta:  ["s-insta",  "▶"],
  data:   ["s-data",   "◆"],
};

const PERSONA: Record<Role, {
  color: string; fill: string; gaugeVal: string; gaugePct: number; why: string;
  alerts: [string, string, string][];
  cta: [string, string];
}> = {
  agent: {
    color: "var(--blue)", fill: "var(--blue)", gaugeVal: "Seller Education", gaugePct: 72,
    why: "Price cuts elevated + buyers payment-sensitive — this is prime time to win listings with a data-led pitch.",
    alerts: [
      ["var(--red)", "Commission rules updated — review forms before next listing", "Today"],
      ["var(--gold)", "3 new competing listings in your focus zip", "3h ago"],
      ["var(--teal)", "New lead from SnapPredict — player guessed your listing area", "1h ago"],
    ],
    cta: ["Generate this week's client brief", "Talking points from today's signals, sent to your phone"],
  },
  seller: {
    color: "var(--orange)", fill: "var(--orange)", gaugeVal: "Elevated Risk", gaugePct: 64,
    why: "Flat prices + rising inventory + builder incentives mean overpriced listings get left behind.",
    alerts: [
      ["var(--red)", "Builder incentives nearby — a credit may beat a price cut", "Today"],
      ["var(--gold)", "Homes in your area averaging longer days on market", "6h ago"],
      ["var(--teal)", "Staging breakdown trending — 2.3M views this week", "2d ago"],
    ],
    cta: ["Get my listing risk report", "How your price + timeline compare to live market signals"],
  },
  buyer: {
    color: "var(--teal)", fill: "var(--teal)", gaugeVal: "Medium–High", gaugePct: 68,
    why: "Listings sitting longer + price cuts + builder incentives = real leverage, especially on new construction.",
    alerts: [
      ["var(--red)", "Rates holding — lock-in window if you find the right home", "Today"],
      ["var(--gold)", "New subdivisions with incentives in your search area", "1d ago"],
      ["var(--teal)", "You can now negotiate buyer-agent fees directly", "3d ago"],
    ],
    cta: ["Find my market advantage", "Weekly digest of price-cut homes + negotiation openings"],
  },
};

const TRENDING: [string, string, number, string][] = [
  ["Commission fee changes", "News · Reddit · X", 88, "var(--red)"],
  ["Seller pricing standoff", "Reddit", 82, "var(--purple)"],
  ["Builder price incentives", "Realtor.com · X", 79, "var(--orange)"],
  ["AI valuation accuracy", "X · Instagram", 71, "var(--blue-l)"],
  ["Sun Belt new supply", "News", 64, "var(--gold)"],
];

const SOURCES: [string, string, number, string][] = [
  ["News",      "🗞️", 90, "var(--blue)"],
  ["Reddit",    "🔴", 78, "#FF4500"],
  ["X",         "✕",  61, "#888"],
  ["Instagram", "📷", 44, "#E1306C"],
];

const PULSE_CELLS = [
  { k: "30-Yr Rate",    v: "6.82%",   cls: "flat", c: "▬ Above 6% through 2026" },
  { k: "Home Prices",   v: "+4.2%",   cls: "up",   c: "▲ YoY Case-Shiller" },
  { k: "Inventory",     v: "Rising",  cls: "up",   c: "▲ 17% below pre-COVID" },
  { k: "Buyer Leverage",v: "Growing", cls: "up",   c: "▲ New-build discounts" },
];

export default function MarketPulse() {
  const [role, setRole]   = useState<Role>("agent");
  const [pill, setPill]   = useState<Pill>("all");
  const [lpRole, setLpRole] = useState<"Buyer"|"Seller"|"Agent">("Buyer");
  const [phone, setPhone] = useState("");
  const [sub, setSub]     = useState(false);
  const [market, setMarket] = useState("🇺🇸 National");
  const [signals, setSignals] = useState<Signal[]>(DEMO_SIGNALS);
  const [isLive, setIsLive]   = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [fetching, setFetching]   = useState(false);

  useEffect(() => {
    fetch("/api/market/signals")
      .then(r => r.json())
      .then(d => {
        if (d.signals?.length > 0) {
          setSignals(d.signals as Signal[]);
          setIsLive(d.hasRealData ?? false);
          if (d.updatedAt) setUpdatedAt(new Date(d.updatedAt).toLocaleTimeString());
        }
      }).catch(() => {});
  }, []);

  async function fetchLive() {
    setFetching(true);
    try {
      await fetch("/api/cron/collect?secret=snapsignal-cron");
      const d = await (await fetch("/api/market/signals")).json();
      if (d.signals?.length > 0) {
        setSignals(d.signals as Signal[]);
        setIsLive(true);
        if (d.updatedAt) setUpdatedAt(new Date(d.updatedAt).toLocaleTimeString());
      }
    } finally { setFetching(false); }
  }

  const filtered = pill === "all" ? signals : signals.filter(s => s.cats.includes(pill));
  const p = PERSONA[role];

  return (
    <div className="app">

      {/* ── LEAD BAR ── */}
      <div className="lead-bar">
        <div className="lead-pitch">
          <b>Stay ahead of the market</b>
          <span>Get buyer, seller, or agent alerts on your phone</span>
        </div>
        <div className="lead-form">
          <div className="lead-persona">
            {(["Buyer","Seller","Agent"] as const).map(r => (
              <button key={r} suppressHydrationWarning
                className={`lp-btn${lpRole===r?" on":""}`}
                onClick={() => setLpRole(r)}>{r}</button>
            ))}
          </div>
          {sub
            ? <input className="lead-input" readOnly value="✓ Subscribed!" style={{borderColor:"var(--teal)",color:"var(--teal)"}}/>
            : <input className="lead-input" type="tel" placeholder="+1 (555) 000-0000"
                value={phone} onChange={e=>setPhone(e.target.value)} suppressHydrationWarning/>}
          <button className="lead-btn" suppressHydrationWarning
            onClick={() => phone && setSub(true)}>
            {sub ? "Done ✓" : "Get Alerts"}
          </button>
          <div className="consent">SMS opt-in. Reply STOP to unsubscribe.</div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="header">
        <div className="brand">
          <div className="brand-mark">📡</div>
          <div>
            <div className="brand-name">SnapMarket <em>Pulse</em></div>
            <div className="brand-sub">Real-time USA real estate intelligence</div>
          </div>
        </div>
        <div className="header-right">
          <select className="market-select" value={market}
            onChange={e=>setMarket(e.target.value)} suppressHydrationWarning>
            {["🇺🇸 National","Texas","Florida","California","Phoenix, AZ","Austin, TX"].map(m=>(
              <option key={m}>{m}</option>
            ))}
          </select>
          <div className="sync-badge">
            <div className="sync-dot"/>
            {isLive ? `Live · ${updatedAt}` : "Demo data"}
          </div>
          <button suppressHydrationWarning
            onClick={fetchLive} disabled={fetching}
            style={{background:"rgba(61,125,255,.12)",border:"1px solid rgba(61,125,255,.25)",borderRadius:8,padding:"6px 14px",color:"var(--blue-l)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            {fetching ? "⟳ Fetching..." : "⟳ Fetch Live Data"}
          </button>
        </div>
      </div>

      {/* ── ROLE TABS ── */}
      <div className="role-tabs">
        <span className="role-lbl">View as</span>
        {(["agent","seller","buyer"] as Role[]).map(r=>(
          <button key={r} suppressHydrationWarning
            className={`role-tab${role===r?` on r-${r}`:""}`}
            onClick={()=>setRole(r)}>
            {r==="agent"?"🏢 Agent":r==="seller"?"🏷️ Seller":"🔑 Buyer"}
          </button>
        ))}
      </div>

      {/* ── PILLS ── */}
      <div className="pills">
        {PILLS.map(p=>(
          <div key={p.id} className={`pill${pill===p.id?" on":""}`}
            onClick={()=>setPill(p.id)}>
            <span className="pdot" style={{background:p.dot}}/>
            {p.label}
          </div>
        ))}
      </div>

      {/* ── PULSE STRIP ── */}
      <div className="pulse-strip">
        <div className="ps-head">
          <div className="ps-title">
            <span>📊</span>
            Today&apos;s Market Pulse
            <span style={{color:"var(--blue-l)",fontWeight:500}}>· {market}</span>
          </div>
          <div className="ps-date">
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
          </div>
        </div>
        <div className="ps-row">
          {PULSE_CELLS.map(c=>(
            <div key={c.k} className="ps-cell">
              <div className="ps-k">{c.k}</div>
              <div className="ps-v">{c.v}</div>
              <div className={`ps-c ${c.cls}`}>{c.c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="main-grid">

        {/* FEED */}
        <div>
          <div className="feed-head">
            <h2>
              {pill==="all" ? "Trending Signals" : PILLS.find(x=>x.id===pill)!.label + " Signals"}
            </h2>
            <span className="feed-count">{filtered.length} signals · {role} view</span>
          </div>

          <div className="feed">
            {filtered.map((s, i) => {
              const [sc, si] = SRC_STYLE[s.src] ?? SRC_STYLE.news;
              const hasLink = s.url && s.url !== "#";

              return (
                <a
                  key={i}
                  href={hasLink ? s.url : undefined}
                  target={hasLink ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    display: "block",
                    cursor: hasLink ? "pointer" : "default",
                    animationDelay: `${i * 0.05}s`
                  }}
                  className="card"
                >
                  <div className="card-body">

                    {/* Source + badge + time */}
                    <div className="card-top">
                      <div className="csrc">
                        <div className={`src-ic ${sc}`}>{si}</div>
                        <span className="src-name">{s.srcName}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className="tspan">{s.time}</span>
                        {hasLink && (
                          <span style={{fontSize:11,color:"var(--blue-l)",fontWeight:600,whiteSpace:"nowrap"}}>
                            Read ↗
                          </span>
                        )}
                        <div className="badges">
                          <span className={`bdg ${s.badge[0]}`}>{s.badge[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Headline — main clickable text */}
                    <div className="card-title" style={{
                      fontSize:15,
                      color: hasLink ? "var(--text)" : "var(--text)",
                    }}>
                      {s.title}
                    </div>

                    {/* Brief explanation */}
                    <div style={{
                      fontSize:12,
                      color:"var(--muted)",
                      lineHeight:1.6,
                      marginBottom:12,
                    }}>
                      {s.why}
                    </div>

                    {/* Role-specific action — highlighted for selected role */}
                    <div style={{
                      background:"rgba(61,125,255,.06)",
                      border:"1px solid rgba(61,125,255,.15)",
                      borderRadius:8,
                      padding:"8px 11px",
                      marginBottom:10,
                    }}>
                      <span style={{
                        fontSize:10,
                        fontWeight:700,
                        textTransform:"uppercase",
                        letterSpacing:".4px",
                        color: role==="buyer"?"var(--teal)":role==="seller"?"var(--orange)":"var(--blue-l)",
                        marginRight:6,
                      }}>
                        {role==="buyer"?"🔑 For you:":role==="seller"?"🏷️ For you:":"🏢 For you:"}
                      </span>
                      <span style={{fontSize:12,color:"var(--text)"}}>
                        {s.actions[role]}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="card-foot">
                      {s.stats.map(([ic,txt],j)=>(
                        <span key={j} className="cstat">{ic} {txt}</span>
                      ))}
                      {hasLink && (
                        <span style={{marginLeft:"auto",fontSize:11,color:"var(--blue-l)",fontWeight:600}}>
                          Click to read full article ↗
                        </span>
                      )}
                    </div>

                  </div>
                </a>
              );
            })}

            {filtered.length === 0 && (
              <div style={{color:"var(--dim)",fontSize:13,padding:"32px 0",textAlign:"center"}}>
                No signals for this category yet.
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="side">

          {/* Role snapshot */}
          <div className="widget">
            <div className="w-title">🎯 {role.charAt(0).toUpperCase()+role.slice(1)} Snapshot</div>
            <div className="gauge">
              <div className="gauge-label">
                {role==="agent"?"Best Opportunity":role==="seller"?"Selling Risk":"Negotiating Power"}
              </div>
              <div className="gauge-val" style={{color:p.color}}>{p.gaugeVal}</div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{width:`${p.gaugePct}%`,background:p.fill}}/>
              </div>
              <div className="gauge-scale"><span>Low</span><span>Medium</span><span>High</span></div>
            </div>
            <div className="why-box">{p.why}</div>
          </div>

          {/* Alerts */}
          <div className="widget">
            <div className="w-title">🔔 {role.charAt(0).toUpperCase()+role.slice(1)} Alerts</div>
            {p.alerts.map(([color,txt,time],i)=>(
              <div key={i} className="walert">
                <div className="walert-dot" style={{background:color}}/>
                <div>
                  <div className="walert-txt">{txt}</div>
                  <div className="walert-time">{time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className="widget">
            <div className="w-title">🔥 Trending Now</div>
            {TRENDING.map(([name,meta,score,color],i)=>(
              <div key={i} className="tr-item">
                <span className="tr-rank">{i+1}</span>
                <div className="tr-mid">
                  <div className="tr-name">{name}</div>
                  <div className="tr-meta">{meta}</div>
                </div>
                <span className="tr-score" style={{color}}>{score}</span>
              </div>
            ))}
          </div>

          {/* Sources */}
          <div className="widget">
            <div className="w-title">📡 Sources Active</div>
            {SOURCES.map(([name,ic,pct,color])=>(
              <div key={name} className="src-bar-row">
                <span className="src-bar-name">{ic} {name}</span>
                <div className="src-bar-track">
                  <div className="src-bar-fill" style={{width:`${pct}%`,background:color}}/>
                </div>
                <span className="src-bar-pct">{pct}%</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="widget wcta">
            <div className="wcta-t">{p.cta[0]}</div>
            <div className="wcta-s">{p.cta[1]}</div>
            <button className="wcta-btn" suppressHydrationWarning>Set it up →</button>
          </div>

        </div>
      </div>

      <div className="footnote">
        SnapMarket Pulse · Sources: Brave Search · Reddit · FRED · Real data via pipeline · snaphomz.com
      </div>
    </div>
  );
}
