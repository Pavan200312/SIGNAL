"use client";
import { useState, useEffect, useRef } from "react";
import { TYPE_KEYWORDS } from "../data";

interface SavedVideo {
  filename: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  size_kb: number;
  generated_at: string;
}

function findMatchingVideo(videos: SavedVideo[], contentType: string): SavedVideo | null {
  const keywords = TYPE_KEYWORDS[contentType] ?? [];
  for (const v of videos) {
    if (keywords.some(kw => v.title.toLowerCase().includes(kw.toLowerCase()))) return v;
  }
  return null;
}

export function VideoModal({ signal, contentType, onClose }: {
  signal: string; contentType: string; onClose: () => void;
}) {
  const [view, setView] = useState<"loading" | "player" | "generating" | "error">("loading");
  const [selected, setSelected] = useState<SavedVideo | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [posting, setPosting] = useState<string | null>(null);
  const [postDone, setPostDone] = useState<string[]>([]);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch("/api/list-videos")
      .then(r => r.json())
      .then(d => {
        const match = findMatchingVideo(d.videos ?? [], contentType);
        if (match) { setSelected(match); setView("player"); }
        else generate();
      })
      .catch(() => generate());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setView("generating");
    try {
      const resp = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: contentType, signal_text: signal, zip_code: "10001" }),
      });
      if (!resp.ok) { setErrMsg(`Server error ${resp.status}`); setView("error"); return; }
      const data = await resp.json();
      if (!data.success) { setErrMsg(data.error || "Generation failed"); setView("error"); return; }
      setSelected({ filename: data.filename, title: data.title, video_url: data.video_url, thumbnail_url: data.thumbnail_url, size_kb: 0, generated_at: new Date().toISOString() });
      setPostDone([]);
      setView("player");
    } catch (e) {
      setErrMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
      setView("error");
    }
  }

  async function postTo(platform: "youtube" | "x") {
    if (!selected) return;
    setPosting(platform);
    try {
      const resp = await fetch("/api/post-video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selected.filename, title: selected.title, caption: "", platforms: [platform] }),
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.success) setPostDone(p => [...p, platform]);
    } finally { setPosting(null); }
  }

  const title = view === "player" ? (selected?.title ?? "Video") : view === "generating" ? "Generating Video…" : "SnapCAC";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(7,17,31,.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ width: 480, background: "#0F1C2E", border: "1px solid rgba(255,107,0,.3)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{title}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 1 }}>Powered by Snaphomz SnapCAC</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "10px 20px", background: "rgba(245,127,46,.07)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#F57F2E", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Signal</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{signal.slice(0, 130)}{signal.length > 130 ? "…" : ""}</div>
        </div>
        <div style={{ padding: 20 }}>
          {(view === "loading" || view === "generating") && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 44, height: 44, border: "3px solid rgba(255,107,0,.15)", borderTop: "3px solid #F57F2E", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>
                {view === "loading" ? "Finding your video…" : "Generating 9:16 video…"}
              </div>
              {view === "generating" && <>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Groq AI → edge-tts voice → Ken Burns</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 4 }}>~60 seconds</div>
              </>}
            </div>
          )}
          {view === "player" && selected && (
            <div>
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 14, background: "#000", maxHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video src={selected.video_url} controls autoPlay muted loop style={{ width: "100%", maxHeight: 360, objectFit: "contain" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{selected.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{new Date(selected.generated_at).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => postTo("youtube")} disabled={!!posting || postDone.includes("youtube")}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: postDone.includes("youtube") ? "#0B5D3B" : posting === "youtube" ? "#333" : "#CC0000", color: "#fff", fontWeight: 700, fontSize: 12, cursor: posting || postDone.includes("youtube") ? "default" : "pointer" }}>
                  {postDone.includes("youtube") ? "✓ Posted" : "▶ Post to YouTube"}
                </button>
                <button disabled style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: "#1a1a1a", color: "rgba(255,255,255,.25)", fontWeight: 700, fontSize: 12, cursor: "not-allowed", border: "1px solid rgba(255,255,255,.06)" }}>
                  𝕏 Coming Soon
                </button>
              </div>
              <button onClick={generate} style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                🎬 Generate fresh video for this signal
              </button>
            </div>
          )}
          {view === "error" && (
            <div style={{ padding: "8px 0" }}>
              <div style={{ fontSize: 13, color: "#FF6B6B", marginBottom: 10 }}>Generation failed</div>
              <pre style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "rgba(255,0,0,.05)", borderRadius: 8, padding: 10, whiteSpace: "pre-wrap", lineHeight: 1.5, marginBottom: 12 }}>{errMsg}</pre>
              <button onClick={generate} style={{ padding: "8px 16px", background: "#F57F2E", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
