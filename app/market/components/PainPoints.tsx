"use client";

interface Pain {
  pain: string;
  category: string;
  count: number;
  cities: string[];
  trend: string;
}

const CAT: Record<string, { bg: string; text: string }> = {
  buyer:    { bg: "bg-orange-50",  text: "text-orange-600" },
  seller:   { bg: "bg-purple-50",  text: "text-purple-600" },
  agent:    { bg: "bg-blue-50",    text: "text-blue-600"   },
  investor: { bg: "bg-emerald-50", text: "text-emerald-600"},
};

const TREND: Record<string, { icon: string; color: string }> = {
  rising:  { icon: "↑", color: "text-red-500" },
  falling: { icon: "↓", color: "text-emerald-500" },
  stable:  { icon: "→", color: "text-gray-400" },
};

export default function PainPoints({ points }: { points: Pain[] }) {
  const max = Math.max(...points.map((p) => p.count));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-base">😤</span>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Top Pain Points</p>
        </div>
        <span className="text-xs text-gray-400">from Reddit + X</span>
      </div>

      <div className="space-y-4">
        {points.slice(0, 6).map((p, i) => {
          const cat = CAT[p.category] ?? CAT.buyer;
          const tr = TREND[p.trend] ?? TREND.stable;
          return (
            <div key={i}>
              <div className="flex items-start gap-3">
                <span className="text-xs font-black text-gray-200 w-5 text-right mt-0.5 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-800 leading-snug">{p.pain}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${cat.bg} ${cat.text}`}>
                      {p.category}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-1.5">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(p.count / max) * 100}%`, transition: "width 0.6s ease" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{p.cities.join(", ")}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-gray-600">{p.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-300">mentions</span>
                      <span className={`text-xs font-bold ml-1 ${tr.color}`}>{tr.icon}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
