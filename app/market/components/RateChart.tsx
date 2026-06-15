"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props {
  data: Array<{ month: string; rate: number }>;
  current: number;
  prev?: number;
}

export default function RateChart({ data, current, prev }: Props) {
  const change = prev ? (current - prev).toFixed(2) : null;
  const isDown = change ? parseFloat(change) < 0 : false;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">30yr Fixed Rate</p>
        {change && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDown ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {isDown ? "▼" : "▲"} {Math.abs(parseFloat(change))}% this week
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black text-gray-900 tracking-tight">{current}%</span>
        <span className="text-sm text-gray-400">/ yr</span>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={["dataMin - 0.2", "dataMax + 0.2"]} tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            labelStyle={{ color: "#6b7280", fontWeight: 600 }}
            itemStyle={{ color: "#f97316" }}
            formatter={(v) => [`${v}%`, "Rate"]}
          />
          <ReferenceLine y={current} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2.5} fill="url(#rateGrad)" dot={false} activeDot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
