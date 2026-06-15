import type { SigTab } from "./data";

export interface LiveSignal {
  cats: string[];
  src: string;
  srcName: string;
  badge: string[];
  title: string;
  why: string;
  score: number;
  scoreLbl: string;
  actions: Record<string, string>;
  stats: string[][];
  time: string;
  url: string;
}

export function catToTab(cats: string[]): SigTab {
  if (cats.includes("rates")) return "Rates";
  if (cats.includes("buyerpain") || cats.includes("sellerpain")) return "Pain";
  if (cats.includes("market")) return "Market";
  if (cats.includes("news")) return "News";
  return "Trends";
}

export function inferContentType(sig: LiveSignal): string {
  const t = sig.title.toLowerCase();
  if (t.includes("rate") || t.includes("mortgage")) return "rate_alert";
  if (t.includes("buyer") || t.includes("pain") || t.includes("buydown")) return "buyer_pain";
  if (t.includes("seller") || t.includes("inventory") || t.includes("list")) return "seller_alert";
  if (t.includes("market") || t.includes("direction")) return "market_update";
  return "news_flash";
}

export function sparkSVG(vals: number[], accent?: boolean): string {
  const W = 100, H = 32, mn = Math.min(...vals), mx = Math.max(...vals), r = mx - mn || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - ((v - mn) / r) * (H - 4) - 2}`).join(" ");
  const lx = W, ly = H - ((vals[vals.length - 1] - mn) / r) * (H - 4) - 2;
  const col = accent ? "#F57F2E" : "#C5C1BA";
  return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${lx}" cy="${ly}" r="2.5" fill="${col}"/></svg>`;
}
