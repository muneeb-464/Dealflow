"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useLeadStore } from "@/store/leadStore";
import { useClientStore } from "@/store/clientStore";
import StatCard from "@/components/dashboard/StatCard";
import type { UserRole } from "@/types/user";

const ROLE_CLS: Record<UserRole, string> = {
  owner:    "bg-primary text-white",
  manager:  "bg-secondary/15 text-primary",
  employee: "bg-neutral/15 text-neutral",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function WorkspacePage() {
  const members = useWorkspaceStore((s) => s.members);
  const leads = useLeadStore((s) => s.leads);
  const clients = useClientStore((s) => s.clients);

  const stats = useMemo(() => ({
    members: members.length,
    active: members.filter((m) => m.status === "active").length,
    leads: leads.length,
    clients: clients.length,
  }), [members, leads, clients]);

  const memberStats = useMemo(() =>
    members.map((m) => ({
      ...m,
      leadCount: leads.filter((l) => (l as { assignedTo?: string }).assignedTo === m.id).length,
      clientCount: clients.filter((c) => c.assignedTo === m.id).length,
    })),
    [members, leads, clients]
  );

  const topPerformer = useMemo(() =>
    [...memberStats].sort((a, b) => (b.leadCount + b.clientCount) - (a.leadCount + a.clientCount))[0],
    [memberStats]
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-primary text-xl">Workspace</h2>
          <p className="text-neutral text-xs mt-0.5">Team overview & collaboration hub</p>
        </div>
        <Link
          href="/team"
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Manage Team
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Team Members" value={String(stats.members)} sub={`${stats.active} active`} icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" accent="secondary" />
        <StatCard label="Total Leads" value={String(stats.leads)} sub="Across all members" icon="M22 12h-4l-3 9L9 3l-3 9H2" accent="secondary" />
        <StatCard label="Total Clients" value={String(stats.clients)} sub="Managed by team" icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" accent="secondary" />
        <StatCard
          label="Top Performer"
          value={topPerformer?.name.split(" ")[0] ?? "—"}
          sub={topPerformer ? `${topPerformer.leadCount} leads · ${topPerformer.clientCount} clients` : "No data yet"}
          icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          accent="tertiary"
        />
      </div>

      {/* Team workload table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral/8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display font-bold text-primary text-sm">Team Workload</p>
            <p className="text-neutral text-xs mt-0.5">Assigned leads & clients per member</p>
          </div>
          <Link href="/team" className="text-[11px] text-secondary font-semibold hover:underline">View team</Link>
        </div>

        {memberStats.length === 0 ? (
          <p className="text-neutral/50 text-xs text-center py-8">No team members yet</p>
        ) : (
          <div className="space-y-3">
            {memberStats.map((m) => {
              const total = m.leadCount + m.clientCount;
              const maxTotal = Math.max(...memberStats.map((x) => x.leadCount + x.clientCount), 1);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold font-display text-[10px]">{getInitials(m.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-xs font-semibold truncate">{m.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_CLS[m.role]}`}>{m.role}</span>
                      </div>
                      <span className="text-neutral text-[11px]">{m.leadCount}L · {m.clientCount}C</span>
                    </div>
                    <div className="h-1.5 bg-neutral/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((total / maxTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: "/team", label: "Manage Team", desc: "Invite members, change roles", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
          { href: "/leads", label: "All Leads", desc: "View & assign lead pipeline", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
          { href: "/clients", label: "All Clients", desc: "View & assign client accounts", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-2xl p-4 border border-neutral/8 shadow-sm hover:border-secondary/30 transition-colors flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: "18px", height: "18px" }}>
                <path d={item.icon} />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-primary text-xs">{item.label}</p>
              <p className="text-neutral text-[11px] mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
