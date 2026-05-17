"use client";
import { useState, useMemo } from "react";
import { useReminderStore } from "@/store/reminderStore";
import AddReminderModal from "@/components/reminders/AddReminderModal";
import StatCard from "@/components/dashboard/StatCard";
import type { Reminder, CreateReminderDto, ReminderType } from "@/types/reminder";

type TabFilter = "all" | ReminderType | "due";

const TAB_LABELS: Record<TabFilter, string> = {
  all: "All",
  due: "Due Today",
  lead: "Leads",
  client: "Clients",
  custom: "Custom",
};

const FREQ_LABELS: Record<string, string> = {
  once: "One-time",
  daily: "Daily",
  every3days: "Every 3 days",
  weekly: "Weekly",
  monthly: "Monthly",
};

const TYPE_CLS: Record<ReminderType, string> = {
  lead: "bg-secondary/10 text-secondary",
  client: "bg-primary/10 text-primary",
  custom: "bg-tertiary/10 text-tertiary",
};

function isDueToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() <= now.getDate()
  );
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, setStatus, markDone } = useReminderStore();

  const [tab, setTab] = useState<TabFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const active = reminders.filter((r) => r.status !== "done");
  const dueToday = active.filter((r) => isDueToday(r.nextReminderAt));

  const filtered = useMemo(() => {
    const base = active;
    if (tab === "all") return base;
    if (tab === "due") return base.filter((r) => isDueToday(r.nextReminderAt));
    return base.filter((r) => r.type === tab);
  }, [reminders, tab]);

  const counts = useMemo(() => ({
    all: active.length,
    due: dueToday.length,
    lead: active.filter((r) => r.type === "lead").length,
    client: active.filter((r) => r.type === "client").length,
    custom: active.filter((r) => r.type === "custom").length,
  }), [active, dueToday]);

  const handleSave = (data: CreateReminderDto) => {
    if (editReminder) {
      updateReminder(editReminder._id, data);
    } else {
      addReminder(data);
    }
    setEditReminder(null);
  };

  const handleEdit = (r: Reminder) => { setEditReminder(r); setModalOpen(true); };
  const confirmDelete = () => {
    if (deleteConfirm) deleteReminder(deleteConfirm);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-primary text-xl">Reminders</h2>
          <p className="text-neutral text-xs mt-0.5">
            {active.length} active · {dueToday.length} due today
          </p>
        </div>
        <button
          onClick={() => { setEditReminder(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Reminder
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Active"
          value={String(active.length)}
          sub={`${reminders.filter((r) => r.status === "done").length} completed`}
          icon="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"
          accent="secondary"
        />
        <StatCard
          label="Due Today"
          value={String(dueToday.length)}
          sub={dueToday.length > 0 ? "Needs attention" : "All clear!"}
          icon="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          accent={dueToday.length > 0 ? "tertiary" : "secondary"}
        />
        <StatCard
          label="Lead Reminders"
          value={String(counts.lead)}
          sub="Follow-up tracking"
          icon="M22 12h-4l-3 9L9 3l-3 9H2"
          accent="secondary"
        />
        <StatCard
          label="Client Reminders"
          value={String(counts.client)}
          sub="Client check-ins"
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          accent="secondary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {(["all", "due", "lead", "client", "custom"] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              tab === t ? "bg-primary text-white" : "bg-white border border-neutral/10 text-neutral hover:text-primary shadow-sm"
            }`}
          >
            {TAB_LABELS[t]} <span className="opacity-50">({counts[t as keyof typeof counts] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Empty */}
      {reminders.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-neutral-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-neutral" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="font-display font-bold text-primary">No reminders yet</p>
          <p className="text-neutral text-sm">Set reminders to stay on top of your leads and clients</p>
          <button
            onClick={() => { setEditReminder(null); setModalOpen(true); }}
            className="mt-1 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Reminder
          </button>
        </div>
      )}

      {/* Reminder list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReminderCard
              key={r._id}
              reminder={r}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirm(id)}
              onMarkDone={markDone}
              onTogglePause={(id) => setStatus(id, r.status === "paused" ? "active" : "paused")}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && reminders.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral/8 flex flex-col items-center justify-center py-12 gap-2">
          <p className="font-display font-bold text-primary text-sm">No reminders match</p>
          <p className="text-neutral text-xs">Try a different filter</p>
        </div>
      )}

      <AddReminderModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditReminder(null); }}
        onSubmit={handleSave}
        initial={editReminder}
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
            <p className="font-display font-bold text-primary text-base">Delete reminder?</p>
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

interface CardProps {
  reminder: Reminder;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
  onMarkDone: (id: string) => void;
  onTogglePause: (id: string) => void;
}

function ReminderCard({ reminder: r, onEdit, onDelete, onMarkDone, onTogglePause }: CardProps) {
  const due = isDueToday(r.nextReminderAt);
  const overdue = isOverdue(r.nextReminderAt) && r.status === "active";
  const paused = r.status === "paused";
  const done = r.status === "done";

  const dueDate = new Date(r.nextReminderAt);
  const dueDateStr = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm transition-all group ${overdue && !done ? "border-tertiary/30" : "border-neutral/8"} ${done ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">

        {/* Done checkbox */}
        <button
          onClick={() => !done && onMarkDone(r._id)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${done ? "bg-secondary border-secondary" : "border-neutral/30 hover:border-secondary"}`}
        >
          {done && (
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-display font-bold text-sm ${done ? "line-through text-neutral" : "text-primary"}`}>{r.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_CLS[r.type]}`}>
                  {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                </span>
                {paused && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral/10 text-neutral">Paused</span>}
                {overdue && !done && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary">Overdue</span>}
              </div>
              {r.description && <p className="text-neutral text-xs mt-0.5 truncate max-w-md">{r.description}</p>}
              {r.linkedName && (
                <p className="text-neutral text-[11px] mt-0.5">Linked: <span className="text-primary font-medium">{r.linkedName}</span></p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onTogglePause(r._id)}
                title={paused ? "Resume" : "Pause"}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors"
              >
                {paused ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => onEdit(r)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary/10 text-neutral hover:text-secondary transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(r._id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-tertiary/10 text-neutral hover:text-tertiary transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] text-neutral">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              {FREQ_LABELS[r.frequency]}
            </div>

            <div className={`flex items-center gap-1 text-[11px] font-medium ${overdue && !done ? "text-tertiary" : due && !done ? "text-secondary" : "text-neutral"}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {due && !done ? "Due today" : dueDateStr}
            </div>

            <div className="flex items-center gap-1.5">
              {r.channels.includes("email") && (
                <span className="text-[10px] font-semibold bg-neutral/8 text-neutral px-1.5 py-0.5 rounded-md">Email</span>
              )}
              {r.channels.includes("whatsapp") && (
                <span className="text-[10px] font-semibold bg-secondary/8 text-secondary px-1.5 py-0.5 rounded-md">WhatsApp</span>
              )}
              {r.channels.includes("in-app") && (
                <span className="text-[10px] font-semibold bg-neutral/8 text-neutral px-1.5 py-0.5 rounded-md">In-App</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
