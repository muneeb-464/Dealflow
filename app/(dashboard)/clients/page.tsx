"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientCard from "@/components/clients/ClientCard";
import ClientTable from "@/components/clients/ClientTable";
import AddClientModal from "@/components/clients/AddClientModal";
import StatCard from "@/components/dashboard/StatCard";
import { useClientStore } from "@/store/clientStore";
import { useReminderStore } from "@/store/reminderStore";
import { useAuthStore } from "@/store/authStore";
import { Client, CreateClientDto } from "@/types/client";
import { formatCurrency } from "@/lib/utils";
import { SkeletonStatCard, SkeletonTable } from "@/components/ui/Skeleton";

type ViewMode = "card" | "table";
type StatusFilter = "All" | Client["status"];

const STATUS_FILTERS: StatusFilter[] = ["All", "active", "inactive", "churned"];
const FILTER_LABELS: Record<StatusFilter, string> = {
  All: "All", active: "Active", inactive: "Inactive", churned: "Churned",
};

export default function ClientsPage() {
  const { clients, loading, fetchClients, addClient, updateClient, deleteClient } = useClientStore();

  useEffect(() => { fetchClients(); }, [fetchClients]);
  const { addReminder } = useReminderStore();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const userRole = authUser?.role ?? "employee";
  const canActOnClient = (client: Client) =>
    userRole === "owner" || userRole === "manager" || client.createdBy === authUser?.id;

  const [view, setView] = useState<ViewMode>("card");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() =>
    clients.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    }), [clients, search, statusFilter]);

  const counts = useMemo(() => {
    const map: Partial<Record<StatusFilter, number>> = { All: clients.length };
    (["active", "inactive", "churned"] as Client["status"][]).forEach((s) => {
      map[s] = clients.filter((c) => c.status === s).length;
    });
    return map;
  }, [clients]);

  const usdRevenue = clients
    .filter((c) => c.status === "active" && c.currency === "USD")
    .reduce((sum, c) => sum + c.totalRevenue, 0);

  const handleSave = async (data: CreateClientDto) => {
    if (editClient) {
      updateClient(editClient._id, data);
    } else {
      addClient(data);
      if (data.status === "active") {
        addReminder({
          title: `Project follow-up — ${data.name}`,
          description: "Active client added. Send a project status update.",
          type: "client",
          linkedName: data.name,
          channels: ["in-app"],
          frequency: "every2days",
          nextReminderAt: new Date(Date.now() + 2 * 86400000).toISOString(),
        });
      }
    }
    setEditClient(null);
  };

  const handleEdit = (client: Client) => {
    if (!canActOnClient(client)) return;
    setEditClient(client);
    setModalOpen(true);
  };
  const handleDelete = (id: string) => {
    const client = clients.find((c) => c._id === id);
    if (client && !canActOnClient(client)) return;
    setDeleteConfirm(id);
  };
  const confirmDelete = () => {
    if (deleteConfirm) deleteClient(deleteConfirm);
    setDeleteConfirm(null);
  };

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-primary text-xl">Clients</h2>
          <p className="text-neutral text-xs mt-0.5">
            {clients.length} total · {counts["active"] ?? 0} active · {counts["churned"] ?? 0} churned
          </p>
        </div>
        <button
          onClick={() => { setEditClient(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Clients"
          value={String(clients.length)}
          sub={`${counts["active"] ?? 0} active`}
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          accent="secondary"
        />
        <StatCard
          label="Active"
          value={String(counts["active"] ?? 0)}
          sub={clients.length > 0 ? `${Math.round(((counts["active"] ?? 0) / clients.length) * 100)}% retention` : "No clients yet"}
          icon="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3"
          accent="secondary"
        />
        <StatCard
          label="USD Revenue"
          value={usdRevenue > 0 ? formatCurrency(usdRevenue, "USD") : "$0"}
          sub={`${clients.filter((c) => c.currency === "USD").length} USD clients`}
          icon="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          accent="secondary"
        />
        <StatCard
          label="Churned"
          value={String(counts["churned"] ?? 0)}
          sub={(counts["churned"] ?? 0) > 0 ? "Needs attention" : "None churned!"}
          icon="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"
          accent={(counts["churned"] ?? 0) > 0 ? "tertiary" : "secondary"}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-neutral/10 rounded-xl px-3 shadow-sm w-full sm:w-56">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-neutral flex-shrink-0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="bg-transparent text-sm text-primary placeholder:text-neutral/45 focus:outline-none py-2.5 w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-neutral/40 hover:text-neutral transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral/10 text-neutral hover:text-primary shadow-sm"
              }`}
            >
              {FILTER_LABELS[s]} <span className="opacity-50">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-neutral/10 rounded-xl p-1 shadow-sm ml-auto">
          <button
            onClick={() => setView("card")}
            title="Card view"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${view === "card" ? "bg-primary text-white" : "text-neutral hover:text-primary"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setView("table")}
            title="Table view"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${view === "table" ? "bg-primary text-white" : "text-neutral hover:text-primary"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="font-display font-bold text-primary">No clients yet</p>
          <p className="text-neutral text-sm">Click "Add Client" to track your first client</p>
          <button
            onClick={() => { setEditClient(null); setModalOpen(true); }}
            className="mt-1 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Client
          </button>
        </div>
      )}

      {/* Content */}
      {clients.length > 0 && (
        view === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((client) => (
              <ClientCard
                key={client._id}
                client={client}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={() => router.push(`/clients/${client._id}`)}
                canEdit={canActOnClient(client)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-12 gap-2">
                <p className="font-display font-bold text-primary text-sm">No clients match</p>
                <p className="text-neutral text-xs">Try adjusting the search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <ClientTable
            clients={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={(id) => router.push(`/clients/${id}`)}
            canEdit={canActOnClient}
          />
        )
      )}

      <AddClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        onSubmit={handleSave}
        initial={editClient}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-tertiary" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <p className="font-display font-bold text-primary text-base">Delete this client?</p>
            <p className="text-neutral text-sm mt-1 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-neutral/20 text-primary text-sm font-semibold rounded-xl hover:bg-neutral-light transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-tertiary text-white text-sm font-semibold rounded-xl hover:bg-tertiary/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
