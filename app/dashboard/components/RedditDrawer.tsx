"use client";
import { useState, useEffect } from "react";

interface InsightSection {
  key: string; title: string; icon: string; summary: string;
  sources: Array<{ title: string; url: string; sub: string }>;
}

const DEMO_SECTIONS: InsightSection[] = [
  {
    key: "rates", title: "Mortgage Rate Sentiment", icon: "📉",
    summary: "Buyers across r/FirstTimeHomeBuyer and r/personalfinance are actively discussing rate buydowns. The 1-point buydown strategy is trending — users report locking at 6.5% with seller concessions. Sentiment: cautiously optimistic. Many are waiting for sub-6.5% before committing.",
    sources: [
      { title: "Anyone getting buydowns under 5%?", url: "https://www.reddit.com/r/FirstTimeHomeBuyer/", sub: "FirstTimeHomeBuyer" },
      { title: "Locked at 6.5% with 1pt buydown — worth it?", url: "https://www.reddit.com/r/personalfinance/", sub: "personalfinance" },
    ],
  },
  {
    key: "buyerpain", title: "Buyer Pain Points", icon: "😤",
    summary: "Top complaints this week: inventory too low in sub-$450k range, bidding wars returning in hot zips, and confusion about buyer-agent agreements post-NAR settlement. Buyers feel unprepared for the new agreement requirement before first showings.",
    sources: [
      { title: "Nothing under $450k has a garage anymore", url: "https://www.reddit.com/r/RealEstate/", sub: "RealEstate" },
      { title: "Do I need to sign before touring?", url: "https://www.reddit.com/r/FirstTimeHomeBuyer/", sub: "FirstTimeHomeBuyer" },
    ],
  },
  {
    key: "selleradvice", title: "Seller Strategy Trends", icon: "🏠",
    summary: "Sellers offering 1-point rate buydowns are getting offers in days vs weeks. Move-in ready is the #1 buyer demand — sellers skipping repairs are seeing price reductions. Reddit consensus: price 2% under comp to trigger multiple offers faster.",
    sources: [
      { title: "Offering buydown got us 3 offers in 2 days", url: "https://www.reddit.com/r/RealEstate/", sub: "RealEstate" },
      { title: "Sold in 4 days — here's what worked", url: "https://www.reddit.com/r/FirstTimeHomeBuyer/", sub: "FirstTimeHomeBuyer" },
    ],
  },
  {
    key: "market", title: "Market Direction Chatter", icon: "📊",
    summary: "Mixed sentiment on market direction. Bullish camp: inventory tightening = prices hold. Bearish camp: affordability crisis will force correction. Most agreed: well-priced move-in ready homes in desirable zips are immune to macro uncertainty.",
    sources: [
      { title: "Is now a good time to buy? Breaking down the math", url: "https://www.reddit.com/r/personalfinance/", sub: "personalfinance" },
      { title: "Austin market update — multiple offers are back", url: "https://www.reddit.com/r/Austin/", sub: "Austin" },
    ],
  },
];

export function RedditDrawer({ onClose }: { onClose: () => void }) {
  const [sections, setSections] = useState<InsightSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/market/reddit-insights")
      .then(r => r.json())
      .then(d => {
        const live = d.sections ?? [];
        setSections(live.length > 0 ? live : DEMO_SECTIONS);
        setUpdatedAt(live.length > 0 ? (d.updatedAt ?? "") : "");
      })
      .catch(err => { console.error("Reddit insights failed:", err); setSections(DEMO_SECTIONS); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: 480, height: "100%", background: "#fff", borderLeft: "1px solid var(--border-1)", boxShadow: "var(--shadow-lg)", overflow: "auto", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--border-1)", background: "#FFF8F5", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🔴</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FF4500" }}>Reddit Intelligence</div>
                <div style={{ fontSize: 11, color: "var(--fg-3)" }}>AI-synthesized insights from real estate communities</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "var(--fg-3)", cursor: "pointer" }}>×</button>
          </div>
          {updatedAt
            ? <span style={{ fontSize: 10, color: "var(--fg-3)" }}>Updated {new Date(updatedAt).toLocaleTimeString()}</span>
            : <span style={{ fontSize: 10, color: "var(--fg-3)" }}>Demo data · Run AI pipeline to load live insights</span>
          }
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--fg-3)", fontSize: 13 }}>
              <div style={{ marginBottom: 10, fontSize: 22 }}>🤖</div>Analyzing Reddit communities…
            </div>
          ) : (
            sections.map((sec, i) => (
              <div key={i} style={{ marginBottom: 18, border: "1px solid var(--border-1)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", background: "#FAFAF8", borderBottom: "1px solid var(--border-1)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{sec.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-1)" }}>{sec.title}</span>
                </div>
                <div style={{ padding: "12px 14px", background: "#fff" }}>
                  <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.65, margin: 0 }}>{sec.summary}</p>
                </div>
                {sec.sources?.length > 0 && (
                  <div style={{ padding: "8px 14px 10px", background: "#FFF8F5", borderTop: "1px solid rgba(255,69,0,.08)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,69,0,.5)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Sources</div>
                    {sec.sources.map((src, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--fg-3)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: 8 }}>
                          r/{src.sub} · {src.title}
                        </span>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: "#FF4500", textDecoration: "none", flexShrink: 0 }}>Source ↗</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
