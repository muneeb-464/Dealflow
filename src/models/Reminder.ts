import mongoose, { Schema, Document, Model } from "mongoose";

export type ReminderStatus = "active" | "done" | "snoozed";
export type ReminderLinkedType = "lead" | "client" | "general";

export interface IReminder extends Document {
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;

  title: string;
  notes?: string;

  // Link to lead or client (optional)
  linkedType?: ReminderLinkedType;
  linkedId?: mongoose.Types.ObjectId;
  linkedName?: string;              // denormalized for display without populate

  status: ReminderStatus;
  nextReminderAt: Date;             // when to fire
  snoozeUntil?: Date;

  // Recurrence
  recurring: boolean;
  recurringInterval?: number;       // days between reminders
  recurringEndAt?: Date;

  emailSent: boolean;               // track if cron already sent email

  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    notes: { type: String },

    linkedType: { type: String, enum: ["lead", "client", "general"] },
    linkedId: { type: Schema.Types.ObjectId },
    linkedName: { type: String },

    status: { type: String, enum: ["active", "done", "snoozed"], default: "active", index: true },
    nextReminderAt: { type: Date, required: true, index: true },   // cron queries this
    snoozeUntil: { type: Date },

    recurring: { type: Boolean, default: false },
    recurringInterval: { type: Number },
    recurringEndAt: { type: Date },

    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReminderSchema.index({ workspaceId: 1, status: 1, nextReminderAt: 1 });
ReminderSchema.index({ workspaceId: 1, assignedTo: 1, status: 1 });

const Reminder: Model<IReminder> = mongoose.models.Reminder ?? mongoose.model<IReminder>("Reminder", ReminderSchema);
export default Reminder;
