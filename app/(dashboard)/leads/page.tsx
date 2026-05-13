"use client";
import { useState, useMemo } from "react";
import { useLeadStore } from "@/store/leadStore";
import LeadTable, { Lead } from "@/components/leads/LeadTable";
import LeadKanban from "@/components/leads/LeadKanban";
import AddLeadModal from "@/components/leads/AddLeadModal";
import { LeadStatus } from "@/components/leads/LeadStatusBadge";

const STATUSES: LeadStatus[] = ["Sent", "Pending", "Follow-up", "Replied", "Converted", "Rejected"];

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, setStatus } = useLeadStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");

  const filtered = useMemo(() =>
    leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.clientName.toLowerCase().includes(q) || l.service.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || l.status === statusFilter;
      return matchSearch && matchStatus;
    }), [leads, search, statusFilter]);

  const counts = useMemo(() => {
    const map: Partial<Record<LeadStatus | "All", number>> = { All: leads.length };
    STATUSES.forEach((s) => { map[s] = leads.filter((l) => l.status === s).length; });
    return map;
  }, [leads]);

  const handleSave = (data: Omit<Lead, "id">) => {
    if (editLead) {
      updateLead(editLead.id, data);
    } else {
      addLead(data);
    }
    setEditLead(null);
  };

  const handleEdit = (lead: Lead) => { setEditLead(lead); setModalOpen(true); };
  const handleDelete = (id: string) => setDeleteConfirm(id);
  const confirmDelete = () => {
    if (deleteConfirm) deleteLead(deleteConfirm);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-primary text-xl">Leads</h2>
          <p className="text-neutral text-xs mt-0.5">
            {leads.length} total · {counts["Converted"] ?? 0} converted · {counts["Follow-up"] ?? 0} need follow-up
          </p>
        </div>
        <button
          onClick={() => { setEditLead(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Lead
        </button>
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
            placeholder="Search..."
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
          {(["All", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral/10 text-neutral hover:text-primary shadow-sm"
              }`}
            >
              {s} <span className="opacity-50">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-neutral/10 rounded-xl p-1 shadow-sm ml-auto">
          <button
            onClick={() => setView("kanban")}
            title="Kanban"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${view === "kanban" ? "bg-primary text-white" : "text-neutral hover:text-primary"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setView("table")}
            title="Table"
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
      {leads.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="font-display font-bold text-primary">No leads yet</p>
          <p className="text-neutral text-sm">Click "Add Lead" to track your first proposal</p>
          <button
            onClick={() => { setEditLead(null); setModalOpen(true); }}
            className="mt-1 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Lead
          </button>
        </div>
      )}

      {/* Content */}
      {leads.length > 0 && (
        view === "kanban"
          ? <LeadKanban leads={filtered} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={setStatus} />
          : <LeadTable leads={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <AddLeadModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditLead(null); }}
        onSave={handleSave}
        editLead={editLead}
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
            <p className="font-display font-bold text-primary text-base">Delete this lead?</p>
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
