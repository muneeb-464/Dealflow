"use client";
import { useMemo } from "react";
import { useLeadStore } from "@/store/leadStore";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LeadStatusBadge, { LeadStatus } from "@/components/leads/LeadStatusBadge";

const PIPELINE_STAGES: LeadStatus[] = ["Sent", "Pending", "Follow-up", "Replied", "Converted", "Rejected"];

const STAGE_COLOR: Record<LeadStatus, string> = {
  Sent:        "bg-neutral/40",
  Pending:     "bg-secondary/40",
  "Follow-up": "bg-tertiary/60",
  Replied:     "bg-secondary/60",
  Converted:   "bg-secondary",
  Rejected:    "bg-tertiary",
};

export default function DashboardPage() {
  const leads = useLeadStore((s) => s.leads);

  const stats = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter((l) => l.status === "Converted").length;
    const followUp = leads.filter((l) => l.status === "Follow-up").length;
    const revenue = leads
      .filter((l) => l.status === "Converted")
      .reduce((sum, l) => sum + Number(l.amount), 0);

    return { total, converted, followUp, revenue };
  }, [leads]);

  const pipelineCounts = useMemo(() =>
    PIPELINE_STAGES.map((s) => ({
      stage: s,
      count: leads.filter((l) => l.status === s).length,
      color: STAGE_COLOR[s],
    })), [leads]);

  const recentLeads = useMemo(() => [...leads].slice(0, 5), [leads]);

  const total = leads.length || 1;

  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Leads"
          value={String(stats.total)}
          sub={stats.total === 0 ? "Add your first lead" : `${stats.converted} converted`}
          icon="M22 12h-4l-3 9L9 3l-3 9H2"
          accent="secondary"
        />
        <StatCard
          label="Converted"
          value={String(stats.converted)}
          sub={stats.total > 0 ? `${Math.round((stats.converted / stats.total) * 100)}% conversion rate` : "No leads yet"}
          icon="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3"
          accent="secondary"
        />
        <StatCard
          label="Revenue (Converted)"
          value={stats.revenue > 0 ? `$${stats.revenue.toLocaleString()}` : "$0"}
          sub={stats.converted > 0 ? `Avg $${Math.round(stats.revenue / stats.converted).toLocaleString()} per deal` : "No conversions yet"}
          icon="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          accent="secondary"
        />
        <StatCard
          label="Follow-ups Due"
          value={String(stats.followUp)}
          sub={stats.followUp > 0 ? "Needs attention" : "All caught up!"}
          icon="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"
          accent={stats.followUp > 0 ? "tertiary" : "secondary"}
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <ActivityFeed />
      </div>

      {/* Pipeline + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lead Pipeline */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <div className="mb-4">
            <p className="font-display font-bold text-primary text-sm">Lead Pipeline</p>
            <p className="text-neutral text-xs mt-0.5">{leads.length} total leads</p>
          </div>
          {leads.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-8">No leads added yet</p>
          ) : (
            <div className="space-y-2.5">
              {pipelineCounts.map(({ stage, count, color }) => (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral">{stage}</span>
                    <span className="text-xs font-bold text-primary">{count}</span>
                  </div>
                  <div className="h-1.5 bg-neutral/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${Math.round((count / total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-bold text-primary text-sm">Recent Leads</p>
              <p className="text-neutral text-xs mt-0.5">Latest added</p>
            </div>
          </div>

          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <p className="text-neutral/50 text-xs">No leads yet — go to Leads page to add one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral/8">
                    {["Client & Service", "Platform", "Amount", "Status"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-neutral uppercase tracking-wide pb-2.5 pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l) => (
                    <tr key={l.id} className="border-b border-neutral/5 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="text-primary text-xs font-semibold">{l.clientName}</p>
                        {l.service && (
                          <p className="text-neutral text-[11px] mt-0.5 truncate max-w-[140px]">{l.service}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-neutral text-xs">{l.platform}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-primary text-xs font-bold font-display">{l.currency} {Number(l.amount).toLocaleString()}</span>
                      </td>
                      <td className="py-3">
                        <LeadStatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
