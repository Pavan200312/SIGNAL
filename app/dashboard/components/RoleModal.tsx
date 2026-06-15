"use client";

export function RoleModal({ onSelect }: { onSelect: (r: "agent" | "seller" | "buyer") => void }) {
  return (
    <div className="smp-modal-overlay">
      <div className="smp-modal">
        <div className="smp-modal-logo">
          <span className="smp-wm-snap">SnapMarket</span>
          <span className="smp-wm-pulse">&nbsp;Pulse</span>
          <div className="smp-pulse-dot" />
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 24 }}>Real estate intelligence, personalized</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--fg-1)", marginBottom: 6 }}>Welcome — who are you?</div>
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 24, lineHeight: 1.6 }}>
          Built for real estate agents. AI pulls from Reddit, X, news, and FRED every morning — synthesized into one action dashboard.
        </div>
        <button className="smp-modal-role-btn" onClick={() => onSelect("agent")} style={{ marginBottom: 0 }}>
          <div className="smp-modal-role-icon">🏢</div>
          <div>
            <div className="smp-modal-role-name">Enter Agent Dashboard</div>
            <div className="smp-modal-role-sub">What changed · Why it matters · What to do today</div>
          </div>
          <span className="smp-modal-arrow">→</span>
        </button>
        <div className="smp-modal-footer">Saved locally · Change anytime from sidebar</div>
      </div>
    </div>
  );
}
