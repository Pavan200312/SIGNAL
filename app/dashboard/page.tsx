"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PRIORITY, STATS, BRIEF, BUYER_PULSE, CLIENT_IMPACT,
  SELLER_OPP, ACTIONS, SIGNALS_STATIC,
  type SigTab,
} from "./data";
import { catToTab, inferContentType, sparkSVG, type LiveSignal } from "./utils";
import { VideoModal } from "./components/VideoModal";
import { RedditDrawer } from "./components/RedditDrawer";
import { RoleModal } from "./components/RoleModal";
import { SourceDrawer } from "./components/SourceDrawer";
import { PainPopup } from "./components/PainPopup";

interface LiveIntelligence {
  rates?: Record<string, { value: number; date: string }>;
  market_signals?: { direction: string; confidence: number; reason: string };
  summary?: string;
  pain_points?: Array<{ pain: string; category: string; count: number; trend: string }>;
  dashboard_stats?: {
    inventory?:    { value: string; delta: string; dir: "up" | "down" | "flat"; meaning: string };
    price_drops?:  { value: string; delta: string; dir: "up" | "down" | "flat"; meaning: string };
    buyer_demand?: { value: string; delta: string; dir: "up" | "down" | "flat"; meaning: string };
  };
}

export default function Dashboard() {
  const [role, setRole]               = useState<"agent" | "seller" | "buyer" | null>(null);
  const [sigTab, setSigTab]           = useState<SigTab>("All");
  const [checked, setChecked]         = useState<Set<number>>(new Set());
  const [showPain, setShowPain]       = useState(false);
  const [showDrawer, setShowDrawer]   = useState(false);
  const [animKey, setAnimKey]         = useState(0);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState("");
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [videoModal, setVideoModal]   = useState<{ signal: string; contentType: string } | null>(null);
  const [showReddit, setShowReddit]   = useState(false);
  const [liveIntelligence, setLiveIntelligence] = useState<LiveIntelligence | null>(null);
  const painTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLiveSignals = useCallback(async () => {
    setLoadingSignals(true);
    try {
      const [sigResp, intResp] = await Promise.all([
        fetch("/api/market/signals"),
        fetch("/api/market/intelligence?type=agent"),
      ]);
      const sigData = await sigResp.json();
      if (sigData.hasRealData && sigData.signals?.length > 0) {
        setLiveSignals(sigData.signals);
        setHasLiveData(true);
        setLiveUpdatedAt(sigData.updatedAt ?? "");
      }
      if (intResp.ok) {
        const intData = await intResp.json();
        if (!intData.error) setLiveIntelligence(intData);
      }
    } catch (err) {
      console.error("Failed to fetch live signals:", err);
    } finally {
      setLoadingSignals(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sm_role") as "agent" | "seller" | "buyer" | null;
    if (saved) { setRole(saved); schedPain(); }
    fetchLiveSignals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (painTimer.current) clearTimeout(painTimer.current); }, []);

  function schedPain() {
    if (painTimer.current) clearTimeout(painTimer.current);
    painTimer.current = setTimeout(() => setShowPain(true), 20000);
  }

  function selectRole(r: "agent" | "seller" | "buyer") {
    setRole(r);
    localStorage.setItem("sm_role", r);
    setSigTab("All");
    setChecked(new Set());
    setAnimKey(k => k + 1);
    schedPain();
  }

  const activeRole = "agent" as const;
  const staticSigs = SIGNALS_STATIC[activeRole];
  const actions    = ACTIONS[activeRole];

  const liveRate = liveIntelligence?.rates?.rate_30yr?.value;
  const liveDir  = liveIntelligence?.market_signals?.direction;
  const aiStats  = liveIntelligence?.dashboard_stats;

  const stats = STATS[activeRole].map((s, i) => {
    if (i === 0 && liveRate) return { ...s, value: `${liveRate}%`, delta: liveRate < 6.9 ? "↓ Falling" : "↑ Rising", meaning: `Rate at ${liveRate}%. ${liveRate < 7 ? "More buyers qualifying — contact waitlist." : "Elevated. Affordability still tight."}` };
    if (i === 1 && aiStats?.inventory)    return { ...s, ...aiStats.inventory };
    if (i === 2 && aiStats?.price_drops)  return { ...s, ...aiStats.price_drops };
    if (i === 3 && aiStats?.buyer_demand) return { ...s, ...aiStats.buyer_demand };
    return s;
  });

  const brief = liveIntelligence?.market_signals ? {
    ...BRIEF[activeRole],
    changed:    liveIntelligence.market_signals.reason ?? BRIEF[activeRole].changed,
    matters:    liveDir === "cooling" ? "Buyers gaining leverage. Sellers need to price competitively. Inventory rising gives buyers more options." : liveDir === "heating" ? "Sellers have the advantage. Buyers need to move decisively." : BRIEF[activeRole].matters,
    opportunity: liveIntelligence.summary ?? BRIEF[activeRole].opportunity,
    confidence: ((liveIntelligence.market_signals.confidence * 100) >= 80 ? "High" : "Medium") as "High" | "Medium" | "Low",
  } : BRIEF[activeRole];

  const priority = liveDir ? {
    ...PRIORITY[activeRole],
    headline: liveDir === "cooling"
      ? `Market cooling — ${Math.round((liveIntelligence?.market_signals?.confidence ?? 0.72) * 100)}% confidence. Buyer leverage returning.`
      : liveDir === "heating" ? "Market heating — seller advantage. Buyers need to move fast."
      : PRIORITY[activeRole].headline,
  } : PRIORITY[activeRole];

  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const top3Signals = hasLiveData && liveSignals.length > 0
    ? [...liveSignals].sort((a, b) => b.score - a.score).slice(0, 3)
    : [];

  const filteredStaticSigs = (sigTab === "All" ? staticSigs : staticSigs.filter(s => s.tab === sigTab))
    .filter(s => s.src !== "Reddit");
  const filteredLiveSigs   = hasLiveData
    ? (sigTab === "All" ? liveSignals : liveSignals.filter(s => catToTab(s.cats) === sigTab))
        .filter(s => !s.src.toLowerCase().includes("reddit"))
    : [];

  const nonRedditLive   = liveSignals.filter(s => !s.src.toLowerCase().includes("reddit"));
  const nonRedditStatic = staticSigs.filter(s => s.src !== "Reddit");
  const tabCounts: Partial<Record<SigTab, number>> = { All: hasLiveData ? nonRedditLive.length : nonRedditStatic.length };
  if (hasLiveData) {
    nonRedditLive.forEach(s => { const tab = catToTab(s.cats); tabCounts[tab] = (tabCounts[tab] ?? 0) + 1; });
  } else {
    nonRedditStatic.forEach(s => { tabCounts[s.tab] = (tabCounts[s.tab] ?? 0) + 1; });
  }

  return (
    <>
      <link rel="stylesheet" href="/snapmarket.css" />
      {!role && <RoleModal onSelect={selectRole} />}
      {showPain && <PainPopup role="agent" onClose={() => setShowPain(false)} />}
      {showDrawer && brief && <SourceDrawer sources={brief.sources} onClose={() => setShowDrawer(false)} />}
      {showReddit && <RedditDrawer onClose={() => setShowReddit(false)} />}
      {videoModal && <VideoModal signal={videoModal.signal} contentType={videoModal.contentType} onClose={() => setVideoModal(null)} />}

      <div className="smp-app">
        {/* SIDEBAR */}
        <aside className="smp-sidebar">
          <div className="smp-sb-logo">
            <div className="smp-wordmark">
              <span className="smp-wm-snap">SnapMarket</span>
              <span className="smp-wm-pulse">&nbsp;Pulse</span>
              <div className="smp-pulse-dot" />
            </div>
            <div className="smp-tagline">Agent action intelligence</div>
          </div>
          <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--border-1)" }}>
            <div className="smp-role-btn active" style={{ cursor: "default" }}>
              <div className="smp-role-icon">🏢</div>
              <div>
                <div>Agent Dashboard</div>
                <div className="smp-role-desc">Market intel & lead actions</div>
              </div>
            </div>
          </div>
          <nav className="smp-nav">
            <div className="smp-lbl">Signal Feed</div>
            {([
              { tab: "All",    icon: "⚡", label: "All Signals"  },
              { tab: "News",   icon: "📰", label: "News"         },
              { tab: "Market", icon: "🏠", label: "Market Data"  },
              { tab: "Rates",  icon: "📉", label: "Rates (FRED)" },
              { tab: "Trends", icon: "📈", label: "Trending"     },
              { tab: "Pain",   icon: "😤", label: "Pain Points"  },
            ] as { tab: SigTab; icon: string; label: string }[]).map(({ tab, icon, label }) => (
              <button key={tab} suppressHydrationWarning
                onClick={() => { setSigTab(tab); document.getElementById("signals-section")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: sigTab === tab ? "var(--snap-orange-soft)" : "transparent",
                  color: sigTab === tab ? "var(--snap-orange)" : "var(--fg-2)",
                  fontFamily: "var(--font)", fontSize: 13, fontWeight: sigTab === tab ? 700 : 400,
                  textAlign: "left", marginBottom: 2,
                }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span>{label}</span>
                {tabCounts[tab] ? (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                    background: sigTab === tab ? "rgba(255,107,0,.2)" : "var(--snap-gray-100)",
                    color: sigTab === tab ? "var(--snap-orange)" : "var(--fg-3)" }}>
                    {tabCounts[tab]}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-1)" }}>
            <div className="smp-lbl" style={{ marginBottom: 8 }}>Social Intelligence</div>
            <button suppressHydrationWarning onClick={() => setShowReddit(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,69,0,.2)", cursor: "pointer", background: "#FFF8F5", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "#FF4500", textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>🔴</span>
              <span>Reddit Intelligence</span>
              <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "rgba(255,69,0,.15)", color: "#FF4500" }}>AI</span>
            </button>
          </div>
          <div className="smp-sb-footer">
            <div className="smp-loc-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              USA · National
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="smp-main">
          <header className="smp-topbar">
            <div>
              <div className="smp-greeting">{greet}, Agent 👋</div>
              <div className="smp-tb-sub">
                {hasLiveData && liveUpdatedAt
                  ? <>Live data · Updated {new Date(liveUpdatedAt).toLocaleTimeString()} &nbsp;·&nbsp; US market is <span className="live">active</span></>
                  : <>USA National &nbsp;·&nbsp; US market is <span className="live">active</span></>}
              </div>
            </div>
            <div className="smp-tb-right">
              {hasLiveData
                ? <div className="smp-upd-pill" style={{ background: "rgba(11,93,59,.15)", color: "#0B5D3B", border: "1px solid rgba(11,93,59,.3)" }}>
                    <div className="smp-live-dot" style={{ background: "#0B5D3B" }} />Live data active
                  </div>
                : <div className="smp-upd-pill"><div className="smp-live-dot" />Demo data</div>}
              <button className="smp-ai-pill" suppressHydrationWarning
                onClick={async () => { await fetch("/api/cron/collect?secret=snapsignal-cron"); setTimeout(fetchLiveSignals, 30000); }}>
                <div className="smp-ai-pill-dot" />
                {loadingSignals ? "LOADING…" : "AI ACTIVE"}
              </button>
              <button className="smp-icon-btn" suppressHydrationWarning>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <div className="smp-notif-dot" />
              </button>
              <div className="smp-avatar">{role ? role[0].toUpperCase() : "?"}</div>
            </div>
          </header>

          {(role || true) && brief ? (
            <div className="smp-content smp-fade-swap" key={animKey}>

              {/* PRIORITY BANNER */}
              <div style={{ background: "linear-gradient(100deg,#F57F2E 0%,#E84C85 60%,#A64EBA 100%)", borderRadius: "var(--r-lg)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.65)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Today&apos;s Agent Opportunity</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{priority?.headline} <span style={{ opacity: .75 }}>{priority?.action}</span></div>
                </div>
                <button suppressHydrationWarning style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.3)", borderRadius: "var(--r-sm)", padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--font)" }}>
                  {priority?.cta} →
                </button>
              </div>

              {/* STAT CARDS */}
              <div className="smp-stats-row">
                {stats.map((s, i) => {
                  const isLiveFRED = i === 0 && !!liveRate;
                  const isLiveAI   = i > 0 && !!aiStats;
                  return (
                    <div key={i} className="smp-stat-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div className="smp-stat-label" style={{ marginBottom: 0 }}>{s.label}</div>
                        {isLiveFRED && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: "var(--r-pill)", background: "#EAF0FF", color: "#0B3D91", letterSpacing: ".05em" }}>FRED</span>}
                        {isLiveAI   && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: "var(--r-pill)", background: "linear-gradient(90deg,#F57F2E22,#A64EBA22)", color: "var(--snap-orange)", letterSpacing: ".05em", border: "1px solid rgba(245,127,46,.2)" }}>AI</span>}
                      </div>
                      <div className={`smp-stat-value${s.accent ? " accent" : ""}`}>{s.value}</div>
                      <div className={`smp-stat-delta ${s.dir}`}>{s.delta}</div>
                      <div className="smp-stat-spark" dangerouslySetInnerHTML={{ __html: sparkSVG(s.spark, s.accent) }} />
                      <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 6, lineHeight: 1.4, fontStyle: "italic", borderTop: "1px solid var(--snap-gray-100)", paddingTop: 6 }}>{s.meaning}</div>
                    </div>
                  );
                })}
              </div>

              {/* AI BRIEF + ACT TODAY */}
              <div className="smp-mid-row">
                <div className="smp-ai-brief">
                  <div className="smp-brief-hd">
                    <div className="smp-brief-badge">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z"/></svg>
                      AI BRIEF
                    </div>
                    <div className="smp-brief-meta">{brief.confidence} confidence · {brief.sources.length} sources</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10 }}>Market Summary</div>
                    <p style={{ fontSize: 13.5, color: "rgba(250,249,245,.78)", lineHeight: 1.65, margin: 0 }}>
                      {liveIntelligence?.summary ?? brief.opportunity}
                    </p>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { icon: "📌", text: brief.changed },
                        { icon: "📊", text: `Market direction: ${liveDir === "cooling" ? "Cooling — buyers gaining leverage" : liveDir === "heating" ? "Heating — seller advantage" : "Stable — balanced conditions"}` },
                        { icon: "⚠️", text: brief.matters },
                      ].map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{pt.icon}</span>
                          <span style={{ fontSize: 12, color: "rgba(250,249,245,.6)", lineHeight: 1.5 }}>{pt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {[
                    { label: "What changed",     text: brief.changed },
                    { label: "Why it matters",   text: brief.matters },
                    { label: "Your opportunity", text: brief.opportunity },
                    { label: "Recommended action", text: brief.action },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em", width: 80, flexShrink: 0, paddingTop: 2, lineHeight: 1.3 }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: i === 3 ? "var(--snap-orange)" : "rgba(250,249,245,.82)", lineHeight: 1.55, fontWeight: i === 3 ? 600 : 400 }}>{row.text}</div>
                    </div>
                  ))}
                  <svg width="100%" height="36" viewBox="0 0 500 36" preserveAspectRatio="none" style={{ opacity: .5 }}>
                    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F57F2E" stopOpacity=".2"/><stop offset="100%" stopColor="#F57F2E" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0,30 C83,25 167,15 250,12 C333,9 417,6 500,4" fill="none" stroke="#F57F2E" strokeWidth="1.5"/>
                    <path d="M0,30 C83,25 167,15 250,12 C333,9 417,6 500,4 L500,36 L0,36 Z" fill="url(#cg)"/>
                    <circle cx="500" cy="4" r="3" fill="#F57F2E" opacity=".8"/>
                  </svg>
                  <div className="smp-brief-tags">{brief.tags.map((t, i) => <div key={i} className="smp-brief-tag">{t}</div>)}</div>
                  <div className="smp-brief-footer">
                    Based on <strong style={{ color: "rgba(255,255,255,.45)" }}>{brief.sources.length} sources</strong> · MLS, Fed, Reuters, Reddit &nbsp;·&nbsp;
                    <button suppressHydrationWarning onClick={() => setShowDrawer(true)} style={{ background: "none", border: "none", color: "rgba(245,127,46,.7)", cursor: "pointer", fontFamily: "var(--font)", fontSize: "inherit", padding: 0 }}>View sources →</button>
                  </div>
                </div>

                <div className="smp-actions-card">
                  <div className="smp-actions-title">Act Today</div>
                  {actions.map((a, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--snap-gray-100)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div className={`smp-action-check${checked.has(i) ? " done" : ""}`}
                          onClick={() => setChecked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}>
                          {checked.has(i) && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className={`smp-action-text${checked.has(i) ? " smp-done-text" : ""}`} style={{ fontWeight: 600, marginBottom: 3 }}>{a.text}</div>
                          <div style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 6 }}>{a.reason}</div>
                          <button suppressHydrationWarning style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--r-pill)", background: "var(--snap-orange-soft)", color: "var(--snap-orange)", border: "1px solid rgba(245,127,46,.2)", cursor: "pointer", fontFamily: "var(--font)" }}>
                            {a.cta} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BUYER PULSE + CLIENT IMPACT */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: "var(--snap-white)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)", marginBottom: 14 }}>Buyer Pulse <span style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 400 }}>— this week from Reddit + X</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {BUYER_PULSE.signals.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{s.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--r-pill)", background: s.color === "#B4261A" ? "var(--danger-bg)" : s.color === "#8A5200" ? "var(--warning-bg)" : "var(--snap-gray-50)", color: s.color }}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Top Buyer Pain Points</div>
                  {BUYER_PULSE.pains.map((p, i) => (
                    <div key={i} style={{ fontSize: 11, color: "var(--fg-2)", padding: "5px 0", borderBottom: "1px solid var(--snap-gray-100)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--danger)", fontSize: 10 }}>●</span>{p}
                    </div>
                  ))}
                </div>

                <div style={{ background: "var(--snap-white)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)", marginBottom: 14 }}>Client Impact <span style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 400 }}>— who to contact today</span></div>
                  {CLIENT_IMPACT.map((c, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--snap-gray-100)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-1)", marginBottom: 2 }}>{c.group}</div>
                          <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 6 }}>{c.signal}</div>
                          <div style={{ fontSize: 11, color: "var(--fg-2)" }}>{c.action}</div>
                        </div>
                        <button suppressHydrationWarning style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--r-pill)", background: c.ctaColor + "18", color: c.ctaColor, border: `1px solid ${c.ctaColor}33`, cursor: "pointer", fontFamily: "var(--font)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {c.cta}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SELLER OPPORTUNITY */}
              <div style={{ background: "var(--snap-white)", border: "1px solid var(--border-1)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)", marginBottom: 14 }}>Seller Opportunity Areas <span style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 400 }}>— where to focus for listings</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {SELLER_OPP.map((s, i) => (
                    <div key={i} style={{ border: `1px solid ${s.urgency === "hot" ? "rgba(245,127,46,.3)" : "var(--border-1)"}`, borderRadius: "var(--r-md)", padding: 14, background: s.urgency === "hot" ? "var(--snap-orange-soft)" : "var(--snap-gray-50)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: "var(--r-pill)", background: s.urgency === "hot" ? "var(--snap-orange)" : "var(--snap-gray-200)", color: s.urgency === "hot" ? "#fff" : "var(--fg-2)" }}>{s.urgency === "hot" ? "🔥 Hot" : "Warm"}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-1)", marginBottom: 4 }}>{s.area}</div>
                      <div style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 4 }}>{s.signal}</div>
                      <div style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 8 }}>Avg DOM: {s.dom}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--snap-orange)" }}>{s.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP 3 VIDEO PICKS */}
              {top3Signals.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-1)" }}>🎬 Top Video Opportunities</span>
                    <span style={{ fontSize: 10, color: "var(--fg-3)" }}>— AI selected · Generate video for these signals</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {top3Signals.map((s, i) => (
                      <div key={i} style={{ border: "2px solid rgba(245,127,46,.35)", borderRadius: 12, padding: 16, background: "linear-gradient(135deg,rgba(245,127,46,.06) 0%,rgba(245,127,46,.02) 100%)", position: "relative" }}>
                        <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "var(--snap-orange)", color: "#fff" }}>#{i + 1}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#F57F2E", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{catToTab(s.cats)}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-1)", lineHeight: 1.4, marginBottom: 8 }}>{s.title.slice(0, 90)}{s.title.length > 90 ? "…" : ""}</div>
                        {s.url
                          ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "var(--fg-3)", display: "block", marginBottom: 10, textDecoration: "none" }}>{(s.srcName?.split("·")[0] ?? s.srcName)?.trim()} ↗</a>
                          : <div style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 10 }}>{(s.srcName?.split("·")[0] ?? s.srcName)?.trim()}</div>}
                        <button suppressHydrationWarning
                          onClick={() => setVideoModal({ signal: s.title, contentType: inferContentType(s) })}
                          style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "#F57F2E", border: "none", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>
                          🎬 Generate Video
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SIGNAL FEED */}
              <div id="signals-section">
                <div className="smp-signals-hd">
                  <div className="smp-signals-title">
                    <div className="smp-live-dot" />
                    {sigTab === "All" ? "Live Signals" : sigTab === "Pain" ? "Pain Points" : sigTab + " Signals"}
                    {hasLiveData
                      ? <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 8, padding: "2px 8px", borderRadius: 4, background: "rgba(11,93,59,.12)", color: "#0B5D3B" }}>● live</span>
                      : <span style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: 8, fontWeight: 400 }}>— click AI ACTIVE to load</span>}
                  </div>
                </div>

                <div className="smp-signals-grid">
                  {hasLiveData ? (
                    filteredLiveSigs.length === 0
                      ? <div style={{ gridColumn: "1/-1", padding: 32, textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>No signals for this category.</div>
                      : filteredLiveSigs.map((s, i) => {
                          const n = filteredLiveSigs.length;
                          const lastRow = i >= n - (n % 3 || 3);
                          const lastCol = (i + 1) % 3 === 0;
                          const [badgeClass, badgeLabel] = s.badge;
                          const scoreColor = s.score >= 80 ? "#B4261A" : s.score >= 65 ? "#8A5200" : "#0B3D91";
                          return (
                            <div key={i} className="smp-signal-cell"
                              style={{ borderBottom: lastRow ? "none" : "1px solid var(--border-1)", borderRight: lastCol ? "none" : "1px solid var(--border-1)" }}>
                              <div className="smp-sig-top">
                                <span className="smp-src-chip" style={{
                                  background: s.src.toLowerCase().includes("reddit") ? "#FFF2EC" : s.src.toLowerCase().includes("x") ? "#F0F0F0" : s.src === "data" ? "#EAF0FF" : "#F5F5F3",
                                  color: s.src.toLowerCase().includes("reddit") ? "#FF4500" : s.src.toLowerCase().includes("x") ? "#0F141A" : s.src === "data" ? "#0B3D91" : "#555",
                                }}>{s.src}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: badgeClass === "b-hot" || badgeClass === "b-pain" ? "#FFF2EC" : badgeClass === "b-tech" ? "#E8F4F8" : "#F0F0F0", color: badgeClass === "b-hot" || badgeClass === "b-pain" ? "#CC3300" : "#555" }}>{badgeLabel}</span>
                                <span className="smp-sig-time">{s.time}</span>
                              </div>
                              <div className="smp-sig-text">{s.title}</div>
                              {s.url
                                ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--snap-orange)", display: "block", marginBottom: 6, textDecoration: "none", fontWeight: 500 }}>{s.srcName} ↗</a>
                                : <div className="smp-sig-sub" style={{ marginBottom: 6 }}>{s.srcName}</div>}
                              {s.why && <div style={{ fontSize: 10, color: "var(--fg-3)", lineHeight: 1.4, marginBottom: 8, borderTop: "1px solid var(--snap-gray-100)", paddingTop: 6 }}>{s.why.slice(0, 100)}{s.why.length > 100 ? "…" : ""}</div>}
                              {s.actions?.agent && <div style={{ fontSize: 10, color: "var(--snap-orange)", marginBottom: 8, fontWeight: 500 }}>→ {s.actions.agent.slice(0, 80)}{s.actions.agent.length > 80 ? "…" : ""}</div>}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: scoreColor + "12", color: scoreColor }}>{s.scoreLbl}</span>
                              </div>
                            </div>
                          );
                        })
                  ) : (
                    filteredStaticSigs.length === 0
                      ? <div style={{ gridColumn: "1/-1", padding: 32, textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>No signals for this category.</div>
                      : filteredStaticSigs.map((s, i) => {
                          const n = filteredStaticSigs.length;
                          const lastRow = i >= n - (n % 3 || 3);
                          const lastCol = (i + 1) % 3 === 0;
                          return (
                            <div key={i} className="smp-signal-cell"
                              style={{ borderBottom: lastRow ? "none" : "1px solid var(--border-1)", borderRight: lastCol ? "none" : "1px solid var(--border-1)" }}>
                              <div className="smp-sig-top">
                                <span className="smp-src-chip" style={{ background: s.bg, color: s.c }}>{s.src}</span>
                                {s.src === "Reddit" && <span style={{ fontSize: 9, background: "#FFF2EC", color: "#FF4500", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>sentiment</span>}
                                <span className="smp-sig-time">{s.t} ago</span>
                              </div>
                              <div className="smp-sig-text">{s.text}</div>
                              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--snap-orange)", display: "block", marginBottom: 4, textDecoration: "none", fontWeight: 500 }}>
                                {s.sub} ↗
                              </a>
                              {s.agentUse && role === "agent" && <div style={{ fontSize: 10, color: "var(--snap-orange)", marginTop: 4, fontWeight: 500 }}>→ {s.agentUse}</div>}
                            </div>
                          );
                        })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-3)", fontSize: 14 }}>
              Select your role to see your personalized dashboard →
            </div>
          )}
        </div>
      </div>
    </>
  );
}
