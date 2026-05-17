"use client";
import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLeadStore } from "@/store/leadStore";
import { useClientStore } from "@/store/clientStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useReminderStore } from "@/store/reminderStore";
import { PLATFORMS } from "@/constants/platforms";
import type { LeadStatus } from "@/components/leads/LeadStatusBadge";

const STATUSES: LeadStatus[] = ["Sent", "Pending", "Follow-up", "Replied", "Converted", "Rejected"];
const STATUS_COLORS: Record<LeadStatus, string> = {
  "Sent": "#767776", "Pending": "#4ADE80", "Follow-up": "#F97316",
  "Replied": "#22c55e", "Converted": "#0A2A22", "Rejected": "#fb923c",
};
const CHANNEL_COLORS: Record<string, string> = { email: "#4ADE80", whatsapp: "#22c55e", "in-app": "#0A2A22" };

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="text-white/50">{payload[0].name}</p>
      <p className="font-bold text-secondary">{payload[0].value} ({payload[0].payload.pct}%)</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const leads = useLeadStore((s) => s.leads);
  const clients = useClientStore((s) => s.clients);
  const members = useWorkspaceStore((s) => s.members);
  const reminders = useReminderStore((s) => s.reminders);

  const kpis = useMemo(() => {
    const total = leads.length || 1;
    const converted = leads.filter((l) => l.status === "Converted").length;
    const followUp = leads.filter((l) => l.status === "Follow-up").length;
    const replied = leads.filter((l) => l.status === "Replied").length;
    const winRate = Math.round((converted / total) * 100);
    const replyRate = Math.round(((replied + converted) / total) * 100);
    const followUpRate = Math.round((followUp / total) * 100);
    const activeClients = clients.filter((c) => c.status === "active").length;
    const clientRetention = clients.length ? Math.round((activeClients / clients.length) * 100) : 0;
    return { winRate, replyRate, followUpRate, clientRetention, converted, total: leads.length };
  }, [leads, clients]);

  const statusDist = useMemo(() => {
    const total = leads.length || 1;
    return STATUSES.map((s) => {
      const count = leads.filter((l) => l.status === s).length;
      return { name: s, value: count, pct: Math.round((count / total) * 100), color: STATUS_COLORS[s] };
    }).filter((s) => s.value > 0);
  }, [leads]);

  const platformLeads = useMemo(() => {
    return PLATFORMS.map((p) => ({
      platform: p.label,
      leads: leads.filter((l) => l.platform.toLowerCase() === p.label.toLowerCase()).length,
      converted: leads.filter((l) => l.platform.toLowerCase() === p.label.toLowerCase() && l.status === "Converted").length,
    })).filter((p) => p.leads > 0).sort((a, b) => b.leads - a.leads);
  }, [leads]);

  const teamPerf = useMemo(() =>
    members.map((m) => ({
      ...m,
      leads: leads.filter((l) => (l as any).assignedTo === m.id).length,
      clients: clients.filter((c) => c.assignedTo === m.id).length,
    })).sort((a, b) => (b.leads + b.clients) - (a.leads + a.clients)),
    [members, leads, clients]
  );

  const channelDist = useMemo(() => {
    const map: Record<string, number> = {};
    reminders.forEach((r) => r.channels.forEach((ch) => { map[ch] = (map[ch] ?? 0) + 1; }));
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map).map(([ch, count]) => ({ ch, count, pct: Math.round((count / total) * 100) }));
  }, [reminders]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-primary text-xl">Analytics</h2>
        <p className="text-neutral text-xs mt-0.5">Performance insights across leads, clients & team</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Win Rate", value: `${kpis.winRate}%`, sub: `${kpis.converted} of ${kpis.total} leads`, good: kpis.winRate >= 20 },
          { label: "Reply Rate", value: `${kpis.replyRate}%`, sub: "Replied + Converted", good: kpis.replyRate >= 30 },
          { label: "Follow-up Rate", value: `${kpis.followUpRate}%`, sub: "Needs attention", good: kpis.followUpRate < 20 },
          { label: "Client Retention", value: `${kpis.clientRetention}%`, sub: "Active clients", good: kpis.clientRetention >= 60 },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-neutral/8 shadow-sm">
            <p className="text-neutral text-[11px]">{k.label}</p>
            <p className={`font-display font-bold text-3xl mt-1 ${k.good ? "text-secondary" : "text-tertiary"}`}>{k.value}</p>
            <p className="text-neutral text-[11px] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Status donut + Platform bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lead status donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-1">Lead Status Mix</p>
          <p className="text-neutral text-xs mb-3">Distribution across pipeline</p>
          {statusDist.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-12">No leads yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {statusDist.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusDist.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-neutral text-[11px]">{s.name}</span>
                    </div>
                    <span className="text-primary text-[11px] font-semibold">{s.value} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform performance bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-1">Platform Performance</p>
          <p className="text-neutral text-xs mb-4">Leads sent vs converted per platform</p>
          {platformLeads.length === 0 ? (
            <div className="flex items-center justify-center h-40"><p className="text-neutral/50 text-xs">No lead data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={platformLeads} barSize={14} barGap={3} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#767776" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#767776" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }} />
                <Bar dataKey="leads" name="Leads Sent" fill="#4ADE80" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#0A2A22" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Team performance + Reminder channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Team performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-1">Team Performance</p>
          <p className="text-neutral text-xs mb-4">Assigned leads & clients per member</p>
          {teamPerf.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-8">No team data</p>
          ) : (
            <div className="space-y-3">
              {teamPerf.map((m) => {
                const max = (teamPerf[0].leads + teamPerf[0].clients) || 1;
                const total = m.leads + m.clients;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold font-display text-[10px]">
                        {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-primary text-xs font-semibold truncate">{m.name}</span>
                        <span className="text-neutral text-[11px] flex-shrink-0 ml-2">{m.leads}L · {m.clients}C</span>
                      </div>
                      <div className="h-1.5 bg-neutral/10 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round((total / max) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reminder channels */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
          <p className="font-display font-bold text-primary text-sm mb-1">Reminder Channels</p>
          <p className="text-neutral text-xs mb-4">How you follow up</p>
          {channelDist.length === 0 ? (
            <p className="text-neutral/50 text-xs text-center py-8">No reminders</p>
          ) : (
            <div className="space-y-3">
              {channelDist.map(({ ch, count, pct }) => (
                <div key={ch}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-primary text-xs font-semibold capitalize">{ch}</span>
                    <span className="text-neutral text-[11px]">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-neutral/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHANNEL_COLORS[ch] ?? "#4ADE80" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
