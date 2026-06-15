"use client";

interface Topic {
  topic: string;
  category: string;
  affects: string;
  urgency: string;
}

const URGENCY: Record<string, { dot: string; label: string; labelStyle: string }> = {
  high:   { dot: "bg-red-400",    label: "High impact", labelStyle: "bg-red-50 text-red-500"    },
  medium: { dot: "bg-amber-400",  label: "Watch",       labelStyle: "bg-amber-50 text-amber-600" },
  low:    { dot: "bg-gray-300",   label: "Monitor",     labelStyle: "bg-gray-100 text-gray-500"  },
};

const CAT_COLOR: Record<string, string> = {
  market:     "text-blue-500",
  legal:      "text-red-500",
  tech:       "text-violet-500",
  rates:      "text-orange-500",
  investment: "text-emerald-500",
};

export default function TrendingTopics({ topics }: { topics: Topic[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span className="text-base">🔥</span>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Trending This Week</p>
      </div>

      <div className="divide-y divide-gray-50">
        {topics.map((t, i) => {
          const urg = URGENCY[t.urgency] ?? URGENCY.low;
          const catColor = CAT_COLOR[t.category] ?? "text-gray-500";
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${urg.dot} ${t.urgency === "high" ? "animate-pulse" : ""}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{t.topic}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold ${catColor}`}>{t.category}</span>
                  <span className="text-gray-200 text-xs">·</span>
                  <span className="text-[10px] text-gray-400">affects {t.affects}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${urg.labelStyle}`}>
                {urg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
