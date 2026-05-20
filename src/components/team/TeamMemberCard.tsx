"use client";
import type { WorkspaceMember, UserRole } from "@/types/user";

interface Props {
  member: WorkspaceMember;
  leadCount: number;
  clientCount: number;
  winRate?: number;
  isCurrentOwner: boolean;
  onRemove: (id: string) => void;
  onRoleChange: (id: string, role: UserRole) => void;
}

const ROLE_CLS: Record<UserRole, string> = {
  owner:    "bg-primary text-white",
  manager:  "bg-secondary/15 text-primary",
  employee: "bg-neutral/15 text-neutral",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TeamMemberCard({ member, leadCount, clientCount, winRate, isCurrentOwner, onRemove, onRoleChange }: Props) {
  const canEdit = isCurrentOwner && member.role !== "owner";

  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral/8 shadow-sm flex flex-col gap-4">

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold font-display text-sm">{getInitials(member.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-primary text-sm truncate">{member.name}</p>
            <p className="text-neutral text-xs mt-0.5 truncate">{member.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_CLS[member.role]}`}>
            {member.role}
          </span>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-secondary" : "bg-tertiary"}`} />
            <span className="text-[10px] text-neutral capitalize">{member.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-neutral/8">
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-primary text-base">{leadCount}</p>
          <p className="text-neutral text-[10px] mt-0.5">Leads</p>
        </div>
        <div className="w-px h-8 bg-neutral/10" />
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-primary text-base">{clientCount}</p>
          <p className="text-neutral text-[10px] mt-0.5">Clients</p>
        </div>
        <div className="w-px h-8 bg-neutral/10" />
        <div className="flex-1 text-center">
          <p className={`font-display font-bold text-base ${(winRate ?? 0) >= 50 ? "text-secondary" : (winRate ?? 0) >= 25 ? "text-primary" : "text-tertiary"}`}>
            {winRate ?? 0}%
          </p>
          <p className="text-neutral text-[10px] mt-0.5">Win Rate</p>
        </div>
        <div className="w-px h-8 bg-neutral/10" />
        <div className="flex-1 text-center">
          <p className="text-neutral text-[10px]">Joined</p>
          <p className="text-primary text-[11px] font-semibold mt-0.5">
            {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
          </p>
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2 pt-1">
          <select
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value as UserRole)}
            className="flex-1 bg-neutral-light text-primary text-xs font-semibold px-2.5 py-2 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors"
          >
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <button
            onClick={() => onRemove(member.id)}
            className="px-3 py-2 rounded-xl border border-tertiary/20 text-tertiary text-xs font-semibold hover:bg-tertiary/5 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
