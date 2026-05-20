export type ReminderType = "lead" | "client" | "custom";
export type ReminderChannel = "email" | "whatsapp" | "in-app";
export type ReminderFrequency = "once" | "daily" | "every2days" | "every3days" | "weekly" | "monthly";
export type ReminderStatus = "active" | "paused" | "done";

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: ReminderType;
  linkedId?: string;
  linkedName?: string;
  channels: ReminderChannel[];
  frequency: ReminderFrequency;
  nextReminderAt: string;
  lastSentAt?: string;
  status: ReminderStatus;
  createdAt: string;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  type: ReminderType;
  linkedId?: string;
  linkedName?: string;
  channels: ReminderChannel[];
  frequency: ReminderFrequency;
  nextReminderAt: string;
}
