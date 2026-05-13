"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLeadStore } from "@/store/leadStore";

type Range = "weekly" | "monthly" | "quarterly" | "custom";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-bold font-display text-secondary">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function buildWeekly(leads: ReturnType<typeof useLeadStore.getState>["leads"]) {
  const days: { label: string; revenue: number; date: Date }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ date: d, label: d.toLocaleDateString("en-US", { weekday: "short" }), revenue: 0 });
  }
  leads.forEach((l) => {
    if (l.status !== "Converted") return;
    const d = new Date(l.sentAt);
    const slot = days.find((s) => s.date.toDateString() === d.toDateString());
    if (slot) slot.revenue += Number(l.amount);
  });
  return days.map(({ label, revenue }) => ({ label, revenue }));
}

function buildMonthly(leads: ReturnType<typeof useLeadStore.getState>["leads"]) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const slots: { label: string; revenue: number; key: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ label: MONTHS[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}`, revenue: 0 });
  }
  leads.forEach((l) => {
    if (l.status !== "Converted") return;
    const d = new Date(l.sentAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const slot = slots.find((s) => s.key === key);
    if (slot) slot.revenue += Number(l.amount);
  });
  return slots.map(({ label, revenue }) => ({ label, revenue }));
}

function buildQuarterly(leads: ReturnType<typeof useLeadStore.getState>["leads"]) {
  const now = new Date();
  const year = now.getFullYear();
  const slots = [
    { label: "Q1", revenue: 0, months: [0, 1, 2], year },
    { label: "Q2", revenue: 0, months: [3, 4, 5], year },
    { label: "Q3", revenue: 0, months: [6, 7, 8], year },
    { label: "Q4", revenue: 0, months: [9, 10, 11], year },
  ];
  leads.forEach((l) => {
    if (l.status !== "Converted") return;
    const d = new Date(l.sentAt);
    if (d.getFullYear() !== year) return;
    const slot = slots.find((s) => s.months.includes(d.getMonth()));
    if (slot) slot.revenue += Number(l.amount);
  });
  return slots.map(({ label, revenue }) => ({ label, revenue }));
}

function buildCustom(leads: ReturnType<typeof useLeadStore.getState>["leads"], from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  if (diffDays <= 14) {
    const slots: { label: string; revenue: number; dateStr: string }[] = [];
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      slots.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), dateStr: d.toDateString(), revenue: 0 });
    }
    leads.forEach((l) => {
      if (l.status !== "Converted") return;
      const d = new Date(l.sentAt);
      const slot = slots.find((s) => s.dateStr === d.toDateString());
      if (slot) slot.revenue += Number(l.amount);
    });
    return slots.map(({ label, revenue }) => ({ label, revenue }));
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthSet = new Map<string, { label: string; revenue: number }>();
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const k = `${cur.getFullYear()}-${cur.getMonth()}`;
    monthSet.set(k, { label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`, revenue: 0 });
    cur.setMonth(cur.getMonth() + 1);
  }
  leads.forEach((l) => {
    if (l.status !== "Converted") return;
    const d = new Date(l.sentAt);
    if (d < start || d > end) return;
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    const slot = monthSet.get(k);
    if (slot) slot.revenue += Number(l.amount);
  });
  return Array.from(monthSet.values());
}

export default function RevenueChart() {
  const leads = useLeadStore((s) => s.leads);
  const [range, setRange] = useState<Range>("monthly");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const data = useMemo(() => {
    if (range === "weekly")    return buildWeekly(leads);
    if (range === "quarterly") return buildQuarterly(leads);
    if (range === "custom")    return buildCustom(leads, customFrom, customTo);
    return buildMonthly(leads);
  }, [leads, range, customFrom, customTo]);

  const hasData = data.some((d) => d.revenue > 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  const rangeLabel: Record<Range, string> = {
    weekly: "Last 7 days",
    monthly: "Last 12 months",
    quarterly: `Quarterly · ${new Date().getFullYear()}`,
    custom: customFrom && customTo ? `${customFrom} → ${customTo}` : "Pick dates",
  };

  const TABS: { key: Range; label: string }[] = [
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "quarterly", label: "Quarterly" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="font-display font-bold text-primary text-sm">Revenue Overview</p>
          <p className="text-neutral text-xs mt-0.5">{rangeLabel[range]}</p>
        </div>
        {hasData && (
          <p className="font-display font-bold text-secondary text-base">${totalRevenue.toLocaleString()}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 mt-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setRange(t.key); if (t.key === "custom") setShowCustom(true); else setShowCustom(false); }}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              range === t.key ? "bg-primary text-white" : "bg-neutral-light text-neutral hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Custom date pickers */}
      {range === "custom" && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-neutral-light rounded-xl px-3 py-2">
            <span className="text-[11px] text-neutral font-medium">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-transparent text-xs text-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-neutral-light rounded-xl px-3 py-2">
            <span className="text-[11px] text-neutral font-medium">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-transparent text-xs text-primary focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Chart or empty state */}
      {!hasData ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-neutral-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-primary text-xs font-semibold">No revenue yet</p>
          <p className="text-neutral text-[11px] text-center max-w-[180px]">
            Revenue appears here once leads are moved to <span className="text-secondary font-semibold">Converted</span>
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#767776" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#767776" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4ADE80", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4ADE80"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#4ADE80", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
