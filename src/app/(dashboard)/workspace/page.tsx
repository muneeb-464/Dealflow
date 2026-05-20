"use client";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import type { UserRole } from "@/types/user";

interface WorkspaceItem {
  _id: string;
  name: string;
  slug: string;
  currency: string;
  role: string;
  isActive: boolean;
}

interface RealMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  leadCount: number;
  clientCount: number;
}

const ROLE_CLS: Record<UserRole, string> = {
  owner:    "bg-primary text-white",
  manager:  "bg-secondary/15 text-primary",
  employee: "bg-neutral/15 text-neutral",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function WorkspacePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [membersMap, setMembersMap] = useState<Record<string, RealMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
  const [switching, setSwitching] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const wRes = await fetch("/api/workspace/list");
      const wData = await wRes.json();
      if (!wData.workspaces) return;

      const wsItems: WorkspaceItem[] = wData.workspaces;
      setWorkspaces(wsItems);

      // auto-expand all workspaces
      setExpanded(new Set(wsItems.map((w) => w._id)));

      // fetch members for all workspaces in parallel
      const results = await Promise.all(
        wsItems.map((w) =>
          fetch(`/api/workspace/${w._id}/members`)
            .then((r) => r.json())
            .then((d) => ({ id: w._id, members: (d.members ?? []) as RealMember[] }))
            .catch(() => ({ id: w._id, members: [] }))
        )
      );

      const map: Record<string, RealMember[]> = {};
      for (const r of results) map[r.id] = r.members;
      setMembersMap(map);
    } catch {
      showToast("Failed to load workspace data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleSwitch(id: string) {
    setSwitching(id);
    try {
      const res = await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (!res.ok) throw new Error();
      showToast("Workspace switched", "success");
      router.refresh();
      await fetchAll();
    } catch {
      showToast("Failed to switch workspace", "error");
    } finally {
      setSwitching(null);
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Stats for active workspace only
  const activeId = workspaces.find((w) => w.isActive)?._id ?? "";
  const activeMembers = membersMap[activeId] ?? [];

  const stats = useMemo(() => ({
    members: activeMembers.length,
    leads: activeMembers.reduce((s, m) => s + m.leadCount, 0),
    clients: activeMembers.reduce((s, m) => s + m.clientCount, 0),
  }), [activeMembers]);

  const topPerformer = useMemo(() =>
    [...activeMembers].sort((a, b) => (b.leadCount + b.clientCount) - (a.leadCount + a.clientCount))[0],
    [activeMembers]
  );

  const maxTotal = useMemo(() =>
    Math.max(...activeMembers.map((m) => m.leadCount + m.clientCount), 1),
    [activeMembers]
  );

  return (
    <div className="space-y-5">

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "success" ? "bg-primary" : "bg-tertiary"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-primary text-xl">Workspace</h2>
          <p className="text-neutral text-xs mt-0.5">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} · switch anytime</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Workspace
          </button>
          <Link href="/team" className="flex items-center gap-1.5 border border-neutral/20 text-primary text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-neutral-light transition-colors">
            Manage Team
          </Link>
        </div>
      </div>

      {/* Workspace list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-neutral/8 animate-pulse">
              <div className="h-4 bg-neutral/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-neutral/10 rounded w-1/5" />
            </div>
          ))
        ) : workspaces.map((w) => {
          const isOpen = expanded.has(w._id);
          const workspaceMembers = membersMap[w._id] ?? [];
          const wMaxTotal = Math.max(...workspaceMembers.map((m) => m.leadCount + m.clientCount), 1);

          return (
            <div key={w._id} className={`bg-white rounded-2xl border shadow-sm transition-all ${w.isActive ? "border-secondary/30" : "border-neutral/8"}`}>
              {/* Workspace header row */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => toggleExpand(w._id)}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold font-display text-xs ${w.isActive ? "bg-primary text-secondary" : "bg-neutral/15 text-neutral"}`}>
                  {getInitials(w.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-primary text-sm truncate">{w.name}</p>
                    {w.isActive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary flex-shrink-0">Active</span>
                    )}
                  </div>
                  <p className="text-neutral text-[11px] capitalize">{w.role} · {w.currency}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!w.isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSwitch(w._id); }}
                      disabled={switching === w._id}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                    >
                      {switching === w._id ? "Switching..." : "Switch"}
                    </button>
                  )}
                  <svg
                    viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-neutral transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded: animated collapse */}
              <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                <div className="border-t border-neutral/8 px-4 pb-4 pt-3">
                  {workspaceMembers.length === 0 ? (
                    <p className="text-neutral/50 text-xs text-center py-4">No team members yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {workspaceMembers.map((m) => {
                        const total = m.leadCount + m.clientCount;
                        return (
                          <div key={m.id} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {(m as RealMember & { avatar?: string }).avatar ? (
                                <img src={(m as RealMember & { avatar?: string }).avatar!} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-primary font-bold font-display text-[9px]">{getInitials(m.name)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-primary text-xs font-semibold truncate">{m.name}</span>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_CLS[m.role]}`}>{m.role}</span>
                                </div>
                                <span className="text-neutral text-[11px]">{m.leadCount}L · {m.clientCount}C</span>
                              </div>
                              <div className="h-1 bg-neutral/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full transition-all duration-500"
                                  style={{ width: `${Math.round((total / wMaxTotal) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active workspace stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Team Members"
          value={loading ? "—" : String(stats.members)}
          sub="In active workspace"
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          accent="secondary"
        />
        <StatCard
          label="Total Leads"
          value={loading ? "—" : String(stats.leads)}
          sub="Across team"
          icon="M22 12h-4l-3 9L9 3l-3 9H2"
          accent="secondary"
        />
        <StatCard
          label="Total Clients"
          value={loading ? "—" : String(stats.clients)}
          sub="Managed by team"
          icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          accent="secondary"
        />
        <StatCard
          label="Top Performer"
          value={loading ? "—" : (topPerformer?.name.split(" ")[0] ?? "—")}
          sub={loading ? "Loading..." : topPerformer ? `${topPerformer.leadCount}L · ${topPerformer.clientCount}C` : "No data yet"}
          icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          accent="tertiary"
        />
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

      {createOpen && <CreateWorkspaceModal onClose={() => setCreateOpen(false)} onCreated={fetchAll} />}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense>
      <WorkspacePageInner />
    </Suspense>
  );
}

// ── CreateWorkspaceModal ──────────────────────────────────────────────────────
function CreateWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("Workspace name required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      // switch to new workspace
      await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: data.workspace._id }),
      });
      onClose();
      onCreated();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display font-bold text-primary text-base">New Workspace</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral hover:bg-neutral-light transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Digital Marketing"
              className="w-full bg-neutral-light text-primary text-sm px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-neutral-light text-primary text-sm px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors"
            >
              {["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-tertiary text-xs font-semibold">{error}</p>}
        </div>

        <div className="flex gap-2.5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-neutral/20 text-primary font-semibold text-sm rounded-xl hover:bg-neutral-light transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create & Switch"}
          </button>
        </div>
      </div>
    </div>
  );
}

