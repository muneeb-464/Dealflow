"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import AccessGate from "@/components/layout/AccessGate";
import { useUser } from "@clerk/nextjs";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import InviteMemberModal from "@/components/team/InviteMemberModal";
import Link from "next/link";
import type { WorkspaceMember, UserRole, PendingInvite } from "@/types/user";
import type { InviteMemberDto } from "@/types/user";

interface PageAccessRequest {
  _id: string;
  page: string;
  status: string;
  requestNote?: string;
  createdAt: string;
  userId: { _id: string; name: string; email: string };
}

interface ApprovalRequestItem {
  _id: string;
  type: string;
  targetLabel?: string;
  note?: string;
  createdAt: string;
  requestedBy: { name: string; email: string };
}

const APPROVAL_TYPE_LABEL: Record<string, string> = {
  delete_lead: "Delete lead",
  bulk_update_leads: "Bulk update leads",
  delete_client: "Delete client",
};

const ROLE_FILTERS: (UserRole | "All")[] = ["All", "owner", "manager", "employee"];

function TeamPageInner() {
  const { user: clerkUser } = useUser();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [removedInvites, setRemovedInvites] = useState<PendingInvite[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequestItem[]>([]);
  const [pageAccessRequests, setPageAccessRequests] = useState<PageAccessRequest[]>([]);
  const [winRateMap, setWinRateMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [noWorkspace, setNoWorkspace] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editInvite, setEditInvite] = useState<PendingInvite | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace/members");
      const data = await res.json();
      if (res.status === 400 && data.error === "No workspace selected") {
        setNoWorkspace(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const mapped: WorkspaceMember[] = (data.members ?? []).map((m: {
        id: string; userId: string; name: string; email: string; avatar?: string | null; role: UserRole; joinedAt: string; leadCount: number; clientCount: number;
      }) => ({
        id: m.id,
        userId: m.userId,
        name: m.name,
        email: m.email,
        avatar: m.avatar ?? null,
        role: m.role,
        status: "active" as const,
        joinedAt: m.joinedAt,
        leadCount: m.leadCount ?? 0,
        clientCount: m.clientCount ?? 0,
      }));
      setMembers(mapped);
      setPendingInvites(data.pendingInvites ?? []);
      setRemovedInvites(data.removedInvites ?? []);
    } catch {
      showToast("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApprovalRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace/approval-requests");
      if (!res.ok) return;
      const data = await res.json();
      setApprovalRequests(data.requests ?? []);
    } catch { /* owner only — silently ignore for non-owners */ }
  }, []);

  const fetchPageAccessRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace/page-access");
      if (!res.ok) return;
      const data = await res.json();
      setPageAccessRequests((data.grants ?? []).filter((g: PageAccessRequest) => g.status === "pending"));
    } catch { /* manager+ only */ }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchApprovalRequests();
    fetchPageAccessRequests();
    fetch("/api/workspace/analytics/team")
      .then((r) => r.json())
      .then((d) => {
        if (d.members) {
          const map: Record<string, number> = {};
          for (const m of d.members) map[m.userId] = m.stats.winRate ?? 0;
          setWinRateMap(map);
        }
      })
      .catch(() => {});

    // Re-fetch when tab regains focus — catches invite accepted in another session
    const onFocus = () => { fetchMembers(); fetchApprovalRequests(); };
    window.addEventListener("visibilitychange", onFocus);
    return () => window.removeEventListener("visibilitychange", onFocus);
  }, [fetchMembers, fetchApprovalRequests]);

  const currentEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const currentMember = members.find((m) => m.email === currentEmail);
  const isOwner = currentMember?.role === "owner";
  const canInvite = currentMember?.role === "owner" || currentMember?.role === "manager";

  const handleInvite = async (data: InviteMemberDto) => {
    try {
      const res = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, role: data.role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send invite");
      if (json.inviteUrl) {
        const copied = await navigator.clipboard.writeText(json.inviteUrl).then(() => true).catch(() => false);
        showToast(copied ? "Invite link copied to clipboard (email not delivered)" : `Invite link: ${json.inviteUrl}`, "success");
      } else {
        showToast("Invite sent successfully", "success");
      }
      await fetchMembers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send invite", "error");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const res = await fetch("/api/workspace/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to remove member");
      showToast("Member removed", "success");
      await fetchMembers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove member", "error");
    }
  };

  const handleCopyInviteLink = async (invite: PendingInvite) => {
    const url = `${window.location.origin}/invite?token=${invite.token ?? invite._id}`;
    const copied = await navigator.clipboard.writeText(url).then(() => true).catch(() => false);
    showToast(copied ? "Invite link copied!" : `Link: ${url}`, "success");
  };

  const handleEditInvite = async (invite: PendingInvite, role: string) => {
    try {
      const res = await fetch(`/api/workspace/invites/${invite._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update invite");
      if (json.inviteUrl) {
        const copied = await navigator.clipboard.writeText(json.inviteUrl).then(() => true).catch(() => false);
        showToast(copied ? "Invite updated — new link copied!" : "Invite updated", "success");
      } else {
        showToast("Invite updated", "success");
      }
      setEditInvite(null);
      await fetchMembers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update invite", "error");
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/workspace/invites/${inviteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete invite");
      showToast("Invite deleted", "success");
      await fetchMembers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete invite", "error");
    }
  };

  const handleReInvite = async (email: string, role: string) => {
    await handleInvite({ name: "", email, role: role as "manager" | "employee" });
  };

  const handlePageAccessReview = async (grantId: string, decision: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/workspace/page-access/${grantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(`Access ${decision}`, "success");
      setPageAccessRequests((prev) => prev.filter((r) => r._id !== grantId));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to review", "error");
    }
  };

  const handleReviewRequest = async (requestId: string, decision: "approved" | "rejected", reviewNote?: string) => {
    try {
      const res = await fetch(`/api/workspace/approval-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNote }),
      });
      if (!res.ok) throw new Error("Failed to review request");
      showToast(`Request ${decision}`, "success");
      setApprovalRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to review request", "error");
    }
  };

  const filtered = useMemo(
    () => roleFilter === "All" ? members : members.filter((m) => m.role === roleFilter),
    [members, roleFilter]
  );

  const stats = useMemo(() => ({
    total: members.length,
    active: members.length,
    managers: members.filter((m) => m.role === "manager").length,
    employees: members.filter((m) => m.role === "employee").length,
  }), [members]);

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${toast.type === "success" ? "bg-primary" : "bg-tertiary"}`}>
          {toast.msg}
        </div>
      )}

      {/* Edit invite modal */}
      {editInvite && (
        <EditInviteModal
          invite={editInvite}
          onClose={() => setEditInvite(null)}
          onSave={(role) => handleEditInvite(editInvite, role)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/workspace" className="flex items-center gap-1 text-neutral text-xs hover:text-primary transition-colors mb-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Workspace
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-primary text-xl">Team</h2>
            {isOwner && (approvalRequests.length + pageAccessRequests.length) > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-tertiary text-white text-[10px] font-bold animate-pulse">
                {approvalRequests.length + pageAccessRequests.length} pending
              </span>
            )}
          </div>
          <p className="text-neutral text-xs mt-0.5">{stats.total} members · {pendingInvites.length} pending</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { fetchMembers(); fetchApprovalRequests(); }}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral/15 text-neutral hover:text-primary hover:bg-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          {canInvite && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Invite Member
            </button>
          )}
        </div>
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
      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral/8 flex items-center justify-center py-16">
          <p className="text-neutral text-sm">Loading team...</p>
        </div>
      ) : noWorkspace ? (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-secondary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-primary font-semibold text-sm">No workspace yet</p>
          <p className="text-neutral text-xs text-center max-w-xs">Set up your workspace to start inviting team members.</p>
          <Link href="/workspace-setup" className="mt-1 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            Create Workspace
          </Link>
        </div>
      ) : filtered.length === 0 ? (
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
              leadCount={member.leadCount ?? 0}
              clientCount={member.clientCount ?? 0}
              winRate={winRateMap[member.userId ?? ""] ?? 0}
              isCurrentOwner={isOwner}
              onRemove={handleRemove}
              onRoleChange={() => {}}
            />
          ))}
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral/8 shadow-sm p-5">
          <p className="font-display font-bold text-primary text-sm mb-3">Pending Invites ({pendingInvites.length})</p>
          <div className="space-y-1">
            {pendingInvites.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-2.5 border-b border-neutral/8 last:border-0 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-semibold truncate">{inv.email}</p>
                  <p className="text-neutral text-xs capitalize">{inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary">Pending</span>
                  {canInvite && (
                    <>
                      <button
                        onClick={() => handleCopyInviteLink(inv)}
                        title="Copy invite link"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral hover:text-primary hover:bg-neutral-light transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditInvite(inv)}
                        title="Edit invite"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral hover:text-primary hover:bg-neutral-light transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteInvite(inv._id)}
                        title="Delete invite"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral hover:text-tertiary hover:bg-tertiary/8 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removed employees (re-invitable) */}
      {removedInvites.length > 0 && isOwner && (
        <div className="bg-white rounded-2xl border border-neutral/8 shadow-sm p-5">
          <p className="font-display font-bold text-primary text-sm mb-1">Removed Members ({removedInvites.length})</p>
          <p className="text-neutral text-xs mb-3">Previously removed — you can re-invite them.</p>
          <div className="space-y-1">
            {removedInvites.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-2.5 border-b border-neutral/8 last:border-0 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-semibold truncate">{inv.email}</p>
                  <p className="text-neutral text-xs capitalize">{inv.role}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral/10 text-neutral">Removed</span>
                  <button
                    onClick={() => handleReInvite(inv.email, inv.role)}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                  >
                    Re-invite
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page access requests — owner/manager */}
      {(isOwner || canInvite) && pageAccessRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-secondary/20 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-display font-bold text-primary text-sm">Page Access Requests</p>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-primary text-[10px] font-bold">{pageAccessRequests.length}</span>
          </div>
          <div className="space-y-2">
            {pageAccessRequests.map((req) => (
              <div key={req._id} className="flex items-start gap-3 py-3 border-b border-neutral/8 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-semibold">
                    {req.userId?.name ?? "Unknown"}
                    <span className="text-neutral font-normal"> wants access to </span>
                    <span className="capitalize">{req.page}</span>
                  </p>
                  <p className="text-neutral text-xs mt-0.5">{req.userId?.email} · {new Date(req.createdAt).toLocaleDateString()}</p>
                  {req.requestNote && <p className="text-neutral/70 text-xs mt-1 italic">&quot;{req.requestNote}&quot;</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handlePageAccessReview(req._id, "approved")}
                    className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handlePageAccessReview(req._id, "rejected")}
                    className="px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval requests — owner only */}
      {isOwner && approvalRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-tertiary/20 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-display font-bold text-primary text-sm">Pending Approvals</p>
            <span className="px-2 py-0.5 rounded-full bg-tertiary text-white text-[10px] font-bold">{approvalRequests.length}</span>
          </div>
          <div className="space-y-2">
            {approvalRequests.map((req) => (
              <div key={req._id} className="flex items-start gap-3 py-3 border-b border-neutral/8 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-primary text-sm font-semibold">
                    {APPROVAL_TYPE_LABEL[req.type] ?? req.type}
                    {req.targetLabel && <span className="text-neutral font-normal"> — {req.targetLabel}</span>}
                  </p>
                  <p className="text-neutral text-xs mt-0.5">By {req.requestedBy.name} · {new Date(req.createdAt).toLocaleDateString()}</p>
                  {req.note && <p className="text-neutral/70 text-xs mt-1 italic">&quot;{req.note}&quot;</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleReviewRequest(req._id, "approved")}
                    className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewRequest(req._id, "rejected")}
                    className="px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => { await handleInvite(data); setModalOpen(false); }}
      />
    </div>
  );
}

export default function TeamPage() {
  return <AccessGate page="team"><TeamPageInner /></AccessGate>;
}

// ── EditInviteModal ───────────────────────────────────────────────────────────
function EditInviteModal({
  invite,
  onClose,
  onSave,
}: {
  invite: PendingInvite;
  onClose: () => void;
  onSave: (role: string) => void;
}) {
  const [role, setRole] = useState(invite.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-display font-bold text-primary text-base">Edit Invite</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral hover:bg-neutral-light transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-neutral text-xs mb-4 truncate">Editing invite for <strong className="text-primary">{invite.email}</strong></p>
        <p className="text-xs text-neutral/60 mb-4 bg-tertiary/6 border border-tertiary/15 rounded-xl px-3 py-2.5">
          Saving will regenerate the invite token — the old link will stop working.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-primary mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-neutral-light text-primary text-sm px-4 py-3 rounded-xl border border-transparent focus:outline-none focus:border-secondary/50 transition-colors"
          >
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-neutral/20 text-primary font-semibold text-sm rounded-xl hover:bg-neutral-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(role)}
            className="flex-1 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
          >
            Save & Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
