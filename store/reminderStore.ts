import { create } from "zustand";
import type { Reminder, CreateReminderDto, ReminderStatus } from "@/types/reminder";

let _nextId = 10;

const today = new Date().toISOString();
const in3Days = new Date(Date.now() + 3 * 86400000).toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

const INITIAL_REMINDERS: Reminder[] = [
  {
    _id: "r1",
    title: "Follow up with Ahmed on Upwork proposal",
    description: "Check if he reviewed the proposal and send revised pricing",
    type: "lead",
    linkedId: "1",
    linkedName: "Ahmed Khan",
    channels: ["email", "whatsapp"],
    frequency: "every3days",
    nextReminderAt: today,
    status: "active",
    createdAt: yesterday,
  },
  {
    _id: "r2",
    title: "Monthly check-in with TechCorp",
    description: "Review project progress and discuss upsell opportunity",
    type: "client",
    linkedId: "c1",
    linkedName: "TechCorp Solutions",
    channels: ["email"],
    frequency: "monthly",
    nextReminderAt: in3Days,
    status: "active",
    createdAt: yesterday,
  },
  {
    _id: "r3",
    title: "Send invoice reminder to Sara",
    type: "client",
    linkedId: "c2",
    linkedName: "Sara Design",
    channels: ["whatsapp"],
    frequency: "weekly",
    nextReminderAt: in3Days,
    status: "active",
    createdAt: yesterday,
  },
  {
    _id: "r4",
    title: "Update portfolio with Fiverr project",
    type: "custom",
    channels: ["in-app"],
    frequency: "once",
    nextReminderAt: in3Days,
    status: "active",
    createdAt: yesterday,
  },
];

interface ReminderStore {
  reminders: Reminder[];
  addReminder: (data: CreateReminderDto) => void;
  updateReminder: (id: string, data: Partial<CreateReminderDto>) => void;
  deleteReminder: (id: string) => void;
  setStatus: (id: string, status: ReminderStatus) => void;
  markDone: (id: string) => void;
}

export const useReminderStore = create<ReminderStore>((set) => ({
  reminders: INITIAL_REMINDERS,

  addReminder: (data) =>
    set((s) => ({
      reminders: [
        {
          ...data,
          _id: `r${_nextId++}`,
          status: "active",
          createdAt: new Date().toISOString(),
        },
        ...s.reminders,
      ],
    })),

  updateReminder: (id, data) =>
    set((s) => ({
      reminders: s.reminders.map((r) => (r._id === id ? { ...r, ...data } : r)),
    })),

  deleteReminder: (id) =>
    set((s) => ({ reminders: s.reminders.filter((r) => r._id !== id) })),

  setStatus: (id, status) =>
    set((s) => ({
      reminders: s.reminders.map((r) => (r._id === id ? { ...r, status } : r)),
    })),

  markDone: (id) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r._id === id ? { ...r, status: "done", lastSentAt: new Date().toISOString() } : r
      ),
    })),
}));
