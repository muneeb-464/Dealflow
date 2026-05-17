"use client";
import { useState, useMemo } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useLeadStore } from "@/store/leadStore";
import { useClientStore } from "@/store/clientStore";
import { useAuthStore } from "@/store/authStore";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import InviteMemberModal from "@/components/team/InviteMemberModal";
import Link from "next/link";
import type { UserRole } from "@/types/user";

const ROLE_FILTERS: (UserRole | "All")[] = ["All", "owner", "manager", "employee"];

export default function TeamPage() {
  const { members, inviteMember, removeMember, updateRole } = useWorkspaceStore();
  const leads = useLeadStore((s) => s.leads);
  const clients = useClientStore((s) => s.clients);
  const currentUser = useAuthStore((s) => s.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");

  const isOwner = (currentUser?.role ?? "employee") === "owner";

  const filtered = useMemo(() =>
    roleFilter === "All" ? members : members.filter((m) => m.role === roleFilter),
    [members, roleFilter]
  );

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    managers: members.filter((m) => m.role === "manager").length,
    employees: members.filter((m) => m.role === "employee").length,
  }), [members]);

  const getLeadCount = (memberId: string) =>
    leads.filter((l) => (l as { assignedTo?: string }).assignedTo === memberId).length;

  const getClientCount = (memberId: string) =>
    clients.filter((c) => c.assignedTo === memberId).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/workspace" className="flex items-center gap-1 text-neutral text-xs hover:text-primary transition-colors mb-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Workspace
          </Link>
          <h2 className="font-display font-bold text-primary text-xl">Team</h2>
          <p className="text-neutral text-xs mt-0.5">{stats.total} members · {stats.active} active</p>
        </div>
        {(isOwner || currentUser?.role === "manager") && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Managers", value: stats.managers },
          { label: "Employees", value: stats.employees },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-neutral/8 shadow-sm">
            <p className="text-neutral text-xs">{s.label}</p>
            <p className="font-display font-bold text-primary text-2xl mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex gap-2 flex-wrap">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${roleFilter === r ? "bg-primary text-white" : "bg-white border border-neutral/15 text-neutral hover:text-primary"}`}
          >
            {r === "All" ? "All Roles" : r}
            <span className="ml-1.5 opacity-60">
              {r === "All" ? members.length : members.filter((m) => m.role === r).length}
            </span>
          </button>
        ))}
      </div>

      {/* Members grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-primary font-semibold text-sm">No members found</p>
          <p className="text-neutral text-xs">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              leadCount={getLeadCount(member.id)}
              clientCount={getClientCount(member.id)}
              isCurrentOwner={isOwner}
              onRemove={removeMember}
              onRoleChange={updateRole}
            />
          ))}
        </div>
      )}

      <InviteMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={inviteMember}
      />
    </div>
  );
}
