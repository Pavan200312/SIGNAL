"use client";

interface Props {
  sentiment: Record<string, number>;
}

function getStyle(score: number) {
  if (score >= 0.2) return { bar: "bg-emerald-500", text: "text-emerald-600", label: "Optimistic", bg: "bg-emerald-50" };
  if (score >= -0.1) return { bar: "bg-amber-400", text: "text-amber-600", label: "Neutral", bg: "bg-amber-50" };
  return { bar: "bg-red-400", text: "text-red-500", label: "Anxious", bg: "bg-red-50" };
}

export default function CitySentiment({ sentiment }: Props) {
  const cities = Object.entries(sentiment).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Buyer Sentiment by City</p>
      <div className="space-y-3.5">
        {cities.map(([city, score]) => {
          const { bar, text, label, bg } = getStyle(score);
          const pct = Math.round(((score + 1) / 2) * 100);
          return (
            <div key={city}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">{city}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{label}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${bar} rounded-full`} style={{ width: `${pct}%`, transition: "width 0.7s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
