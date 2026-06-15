"use client";
import { useState } from "react";
import { PAIN_OPTS, PAIN_ANSWERS } from "../data";

export function PainPopup({ role, onClose }: { role: "agent" | "seller" | "buyer"; onClose: () => void }) {
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="smp-pain-popup">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="smp-pain-title">Quick question 👋</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--fg-3)", cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      {!sel ? (
        <>
          <div className="smp-pain-sub">Facing any of these? Tap one — we&apos;ll show what&apos;s working for others.</div>
          <div className="smp-pain-grid">
            {PAIN_OPTS[role]?.map(o => (
              <button key={o.label} className="smp-pain-opt" onClick={() => setSel(o.label)}>
                <span>{o.icon}</span><span>{o.label}</span>
              </button>
            ))}
          </div>
          <button className="smp-pain-skip" onClick={onClose}>Skip</button>
        </>
      ) : (
        <>
          <div className="smp-pain-answer">
            <strong>You&apos;re not alone.</strong> {PAIN_ANSWERS[sel] ?? "This is a top pain point this week across Reddit + X."}
          </div>
          <button className="smp-pain-close" onClick={onClose}>Got it</button>
        </>
      )}
    </div>
  );
}
