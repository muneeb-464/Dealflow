"use client";
import { useMemo } from "react";
import { useClientStore } from "@/store/clientStore";
import { useLeadStore } from "@/store/leadStore";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Client } from "@/types/client";

const STATUS_CLS: Record<Client["status"], string> = {
  active:   "bg-secondary/10 text-secondary",
  inactive: "bg-neutral/10 text-neutral",
  churned:  "bg-tertiary/15 text-tertiary",
};

const CURRENCY_COLORS = ["bg-secondary", "bg-tertiary", "bg-primary", "bg-neutral/60", "bg-secondary/50", "bg-tertiary/50", "bg-primary/50"];

export default function RevenuePage() {
  const clients = useClientStore((s) => s.clients);
  const leads = useLeadStore((s) => s.leads);

  const stats = useMemo(() => {
    const active = clients.filter((c) => c.status === "active");
    const usdRevenue = active.filter((c) => c.currency === "USD").reduce((s, c) => s + c.totalRevenue, 0);
    const converted = leads.filter((l) => l.status === "Converted");
    const leadRevenue = converted.reduce((s, l) => s + Number(l.amount), 0);
    const avgDeal = converted.length ? Math.round(leadRevenue / converted.length) : 0;
    return { activeCount: active.length, usdRevenue, leadRevenue, avgDeal, convertedCount: converted.length };
  }, [clients, leads]);

  const byClient = useMemo(() =>
    [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue),
    [clients]
  );

  const byCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      map[c.currency] = (map[c.currency] ?? 0) + c.totalRevenue;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [clients]);

  const maxRevenue = byClient[0]?.totalRevenue || 1;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-primary text-xl">Revenue</h2>
        <p className="text-neutral text-xs mt-0.5">Track earnings across clients and leads</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Active Client Revenue (USD)"
          value={`$${stats.usdRevenue.toLocaleString()}`}
          sub={`${stats.activeCount} active clients`}
          icon="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          accent="secondary"
        />
        <StatCard
          label="Lead Revenue (Converted)"
          value={`$${stats.leadRevenue.toLocaleString()}`}
          sub={`${stats.convertedCount} converted leads`}
          icon="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3"
          accent="secondary"
        />
        <StatCard
          label="Avg Deal Value"
          value={stats.avgDeal > 0 ? `$${stats.avgDeal.toLocaleString()}` : "$0"}
          sub={stats.convertedCount > 0 ? "Per converted lead" : "No conversions yet"}
          icon="M18 20V10 M12 20V4 M6 20v-6"
          accent={stats.avgDeal > 0 ? "secondary" : "tertiary"}
        />
        <StatCard
          label="Total Clients"
          value={String(clients.length)}
          sub={`${clients.filter(c => c.status === "churned").length} churned`}
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          accent="secondary"
        />
      </div>

      {/* Revenue chart + Currency breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Revenue by currency */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-1">By Currency</p>
          <p className="text-neutral text-xs mb-4">Client revenue per currency</p>
          {byCurrency.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-8">No revenue data</p>
          ) : (
            <div className="space-y-3">
              {byCurrency.map(([currency, amount], i) => (
                <div key={currency}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-primary">{currency}</span>
                    <span className="text-xs font-bold font-display text-primary">{formatCurrency(amount, currency)}</span>
                  </div>
                  <div className="h-1.5 bg-neutral/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CURRENCY_COLORS[i % CURRENCY_COLORS.length]}`}
                      style={{ width: `${Math.round((amount / byCurrency[0][1]) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Client revenue table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
        <div className="mb-4">
          <p className="font-display font-bold text-primary text-sm">Client Revenue Breakdown</p>
          <p className="text-neutral text-xs mt-0.5">Sorted by total revenue</p>
        </div>

        {byClient.length === 0 ? (
          <p className="text-neutral/50 text-xs text-center py-8">No clients yet</p>
        ) : (
          <div className="space-y-3">
            {byClient.map((c) => (
              <div key={c._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold font-display text-[11px]">{getInitials(c.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-primary text-xs font-semibold truncate">{c.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_CLS[c.status]}`}>{c.status}</span>
                    </div>
                    <span className="text-primary text-xs font-bold font-display flex-shrink-0 ml-2">{formatCurrency(c.totalRevenue, c.currency)}</span>
                  </div>
                  <div className="h-1.5 bg-neutral/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.status === "active" ? "bg-secondary" : c.status === "churned" ? "bg-tertiary" : "bg-neutral/40"}`}
                      style={{ width: `${Math.round((c.totalRevenue / maxRevenue) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
