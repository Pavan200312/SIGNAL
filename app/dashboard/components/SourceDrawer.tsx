"use client";
import { BRIEF } from "../data";

type BriefSource = typeof BRIEF["agent"]["sources"][number];

export function SourceDrawer({ sources, onClose }: { sources: BriefSource[]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: 480, height: "100%", background: "var(--snap-white)", borderLeft: "1px solid var(--border-1)", boxShadow: "var(--shadow-lg)", overflow: "auto", padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-1)" }}>Source Intelligence</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "var(--fg-3)", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 20, lineHeight: 1.6, padding: "10px 12px", background: "var(--snap-cream)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-1)" }}>
          <strong style={{ color: "var(--fg-2)" }}>Note:</strong> Reddit and X signals are labeled as <em>sentiment</em>, not verified fact. News and MLS data are sourced directly.
        </div>
        {sources.map((s, i) => (
          <div key={i} style={{ border: "1px solid var(--border-1)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 10, background: s.category === "Social Sentiment" ? "#FFF8F5" : "var(--snap-white)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--r-pill)", background: s.category === "Social Sentiment" ? "#FFF2EC" : s.category === "MLS" ? "#E6F4EC" : "#EAF0FF", color: s.category === "Social Sentiment" ? "#FF4500" : s.category === "MLS" ? "#2D6A4F" : "#0B3D91" }}>{s.category}</span>
              <span style={{ fontSize: 10, color: "var(--fg-3)", marginLeft: "auto" }}>{s.time}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-1)", marginBottom: 6 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 10 }}>{s.summary}</div>
            <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: "var(--snap-orange)", textDecoration: "none" }}>View original source ↗</a>
          </div>
        ))}
      </div>
    </div>
  );
}
