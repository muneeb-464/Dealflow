import { create } from "zustand";
import type { Reminder, CreateReminderDto, ReminderStatus } from "@/types/reminder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUIReminder(doc: any): Reminder {
  return {
    _id: String(doc._id),
    title: doc.title,
    description: doc.notes ?? doc.description,
    type: (doc.linkedType === "general" ? "custom" : doc.linkedType) ?? "custom",
    linkedId: doc.linkedId ? String(doc.linkedId) : undefined,
    linkedName: doc.linkedName,
    channels: doc.channels ?? ["in-app"],
    frequency: doc.frequency ?? "once",
    nextReminderAt: doc.nextReminderAt
      ? new Date(doc.nextReminderAt).toISOString()
      : new Date().toISOString(),
    lastSentAt: doc.lastSentAt ? new Date(doc.lastSentAt).toISOString() : undefined,
    status: doc.status ?? "active",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

interface ReminderStore {
  reminders: Reminder[];
  loading: boolean;
  fetchReminders: () => Promise<void>;
  addReminder: (data: CreateReminderDto) => Promise<void>;
  updateReminder: (id: string, data: Partial<CreateReminderDto>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  setStatus: (id: string, status: ReminderStatus) => Promise<void>;
  markDone: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  loading: false,

  fetchReminders: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      if (res.ok) set({ reminders: (data.reminders ?? []).map(toUIReminder) });
    } finally {
      set({ loading: false });
    }
  },

  addReminder: async (data) => {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok && json.reminder) {
      set((s) => ({ reminders: [toUIReminder(json.reminder), ...s.reminders] }));
    }
  },

  updateReminder: async (id, data) => {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok && json.reminder) {
      set((s) => ({
        reminders: s.reminders.map((r) => (r._id === id ? toUIReminder(json.reminder) : r)),
      }));
    }
  },

  deleteReminder: async (id) => {
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (res.ok) set((s) => ({ reminders: s.reminders.filter((r) => r._id !== id) }));
  },

  setStatus: async (id, status) => {
    await get().updateReminder(id, { nextReminderAt: new Date().toISOString() });
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (res.ok && json.reminder) {
      set((s) => ({
        reminders: s.reminders.map((r) => (r._id === id ? toUIReminder(json.reminder) : r)),
      }));
    }
  },

  markDone: async (id) => {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    const json = await res.json();
    if (res.ok && json.reminder) {
      set((s) => ({
        reminders: s.reminders.map((r) => (r._id === id ? toUIReminder(json.reminder) : r)),
      }));
    }
  },
}));
