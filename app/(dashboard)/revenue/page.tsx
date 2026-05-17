"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useClientStore } from "@/store/clientStore";
import { useLeadStore } from "@/store/leadStore";
import { PLATFORMS, PLATFORM_COLORS } from "@/constants/platforms";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Client } from "@/types/client";

const STATUS_CLS: Record<Client["status"], string> = {
  active:   "bg-secondary/10 text-secondary",
  inactive: "bg-neutral/10 text-neutral",
  churned:  "bg-tertiary/15 text-tertiary",
};

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-bold font-display text-secondary">{payload[0].value.toLocaleString()} USD eq.</p>
    </div>
  );
}

export default function RevenuePage() {
  const clients = useClientStore((s) => s.clients);
  const leads = useLeadStore((s) => s.leads);

  const stats = useMemo(() => {
    const active = clients.filter((c) => c.status === "active");
    const churned = clients.filter((c) => c.status === "churned");
    const converted = leads.filter((l) => l.status === "Converted");
    const leadRevenue = converted.reduce((s, l) => s + Number(l.amount), 0);
    const avgDeal = converted.length ? Math.round(leadRevenue / converted.length) : 0;
    return { active: active.length, churned: churned.length, leadRevenue, avgDeal, convertedCount: converted.length };
  }, [clients, leads]);

  const byPlatform = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      const usdEq = c.currency === "USD" ? c.totalRevenue
        : c.currency === "PKR" ? c.totalRevenue / 280
        : c.currency === "GBP" ? c.totalRevenue * 1.27
        : c.currency === "AED" ? c.totalRevenue * 0.27
        : c.totalRevenue;
      map[c.platform] = (map[c.platform] ?? 0) + Math.round(usdEq);
    });
    return PLATFORMS
      .map((p) => ({ platform: p.label, value: map[p.value] ?? 0, key: p.value }))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [clients]);

  const byClient = useMemo(() =>
    [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue),
    [clients]
  );

  const byCurrency = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    clients.forEach((c) => {
      if (!map[c.currency]) map[c.currency] = { total: 0, count: 0 };
      map[c.currency].total += c.totalRevenue;
      map[c.currency].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [clients]);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-primary text-xl">Revenue</h2>
        <p className="text-neutral text-xs mt-0.5">Financial breakdown across clients & deals</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Converted Lead Revenue", value: `$${stats.leadRevenue.toLocaleString()}`, sub: `${stats.convertedCount} deals closed`, green: true },
          { label: "Avg Deal Size", value: stats.avgDeal > 0 ? `$${stats.avgDeal.toLocaleString()}` : "—", sub: "Per converted lead", green: stats.avgDeal > 0 },
          { label: "Active Clients", value: String(stats.active), sub: "Ongoing relationships", green: true },
          { label: "Churned Clients", value: String(stats.churned), sub: "Lost accounts", green: false },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-neutral/8 shadow-sm">
            <p className="text-neutral text-[11px]">{k.label}</p>
            <p className={`font-display font-bold text-2xl mt-1 ${k.green ? "text-primary" : "text-tertiary"}`}>{k.value}</p>
            <p className="text-neutral text-[11px] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Platform bar chart + Currency pills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue by platform — bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm">Revenue by Platform</p>
          <p className="text-neutral text-xs mt-0.5 mb-5">Client revenue converted to USD equivalent</p>
          {byPlatform.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-neutral/50 text-xs">No client revenue yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byPlatform} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#767776" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#767776" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<TooltipContent />} cursor={{ fill: "rgba(74,222,128,0.06)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byPlatform.map((entry) => {
                    const color = PLATFORM_COLORS[entry.key as keyof typeof PLATFORM_COLORS]?.color ?? "#4ADE80";
                    return <Cell key={entry.key} fill={color} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by currency */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm">By Currency</p>
          <p className="text-neutral text-xs mt-0.5 mb-4">Client totals per currency</p>
          {byCurrency.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {byCurrency.map(([currency, { total, count }]) => (
                <div key={currency} className="flex items-center justify-between p-3 rounded-xl bg-neutral-light">
                  <div>
                    <p className="text-primary text-xs font-bold font-display">{currency}</p>
                    <p className="text-neutral text-[11px] mt-0.5">{count} client{count > 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-primary font-display font-bold text-sm">{formatCurrency(total, currency)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Client revenue table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
        <p className="font-display font-bold text-primary text-sm mb-1">Client Accounts</p>
        <p className="text-neutral text-xs mb-4">All clients sorted by revenue</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral/8">
                {["Client", "Platform", "Status", "Projects", "Total Revenue"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-neutral uppercase tracking-wide pb-2.5 pr-4 last:pr-0 last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byClient.map((c) => {
                const plat = PLATFORMS.find((p) => p.value === c.platform)?.label ?? c.platform;
                const platColor = PLATFORM_COLORS[c.platform as keyof typeof PLATFORM_COLORS];
                return (
                  <tr key={c._id} className="border-b border-neutral/5 last:border-0 hover:bg-neutral-light/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-secondary font-bold font-display text-[10px]">{getInitials(c.name)}</span>
                        </div>
                        <div>
                          <p className="text-primary text-xs font-semibold">{c.name}</p>
                          {c.company && <p className="text-neutral text-[11px]">{c.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: platColor?.bg, color: platColor?.color }}>{plat}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-neutral text-xs">{c.projectsCount}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-primary font-bold font-display text-sm">{formatCurrency(c.totalRevenue, c.currency)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
