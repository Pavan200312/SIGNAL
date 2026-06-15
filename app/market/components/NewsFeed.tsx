"use client";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  category: string;
  source?: string;
  age?: string;
}

const CAT: Record<string, { bg: string; text: string }> = {
  market:     { bg: "bg-blue-50",    text: "text-blue-600"    },
  rates:      { bg: "bg-orange-50",  text: "text-orange-600"  },
  tech:       { bg: "bg-violet-50",  text: "text-violet-600"  },
  legal:      { bg: "bg-red-50",     text: "text-red-500"     },
  investment: { bg: "bg-emerald-50", text: "text-emerald-600" },
  industry:   { bg: "bg-amber-50",   text: "text-amber-600"   },
};

function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function NewsFeed({ news, activeFilter }: { news: NewsItem[]; activeFilter: string }) {
  const filtered = activeFilter === "all" ? news : news.filter((n) => n.category === activeFilter);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📰</span>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Latest Intelligence</p>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} articles</span>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.slice(0, 6).map((item, i) => {
          const cat = CAT[item.category] ?? CAT.market;
          const isReal = item.url && item.url !== "#";
          const domain = isReal ? getDomain(item.url) : null;

          return (
            <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors group">
              {/* Category + source + time */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                  {item.category}
                </span>
                {item.source && (
                  <span className="text-[10px] text-gray-500 font-semibold">{item.source}</span>
                )}
                {item.age && (
                  <span className="text-[10px] text-gray-300 ml-auto">{item.age}</span>
                )}
              </div>

              {/* Headline */}
              <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">
                {item.title}
              </p>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-gray-400 leading-relaxed mb-2.5 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Read article button — always visible */}
              {isReal ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 px-3 py-1.5 rounded-lg transition-all"
                >
                  Read at {domain}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-gray-300 px-3 py-1.5">
                  Link unavailable
                </span>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No articles for this category. Run pipeline to fetch live data.
        </div>
      )}
    </div>
  );
}
