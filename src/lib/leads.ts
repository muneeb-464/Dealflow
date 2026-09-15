import type mongoose from "mongoose";
import { Reminder } from "@/models";

/** A closed lead (converted / rejected / dead) should not keep nagging — mark its reminders done. */
export async function closeLeadReminders(workspaceId: mongoose.Types.ObjectId, leadId: mongoose.Types.ObjectId) {
  await Reminder.updateMany(
    { workspaceId, linkedType: "lead", linkedId: leadId, status: { $ne: "done" } },
    { $set: { status: "done" } }
  );
}
