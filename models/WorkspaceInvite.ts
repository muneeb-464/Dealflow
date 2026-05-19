import mongoose, { Schema, Document, Model } from "mongoose";
import type { MemberRole } from "./WorkspaceMember";

export type InviteStatus = "pending" | "accepted" | "expired" | "revoked" | "removed";

export interface IWorkspaceInvite extends Document {
  workspaceId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;   // User who sent invite
  email: string;
  role: MemberRole;
  token: string;                         // UUID — sent in invite link
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

const WorkspaceInviteSchema = new Schema<IWorkspaceInvite>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["owner", "manager", "employee"], required: true },
    token: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "expired", "revoked", "removed"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const WorkspaceInvite: Model<IWorkspaceInvite> =
  mongoose.models.WorkspaceInvite ?? mongoose.model<IWorkspaceInvite>("WorkspaceInvite", WorkspaceInviteSchema);
export default WorkspaceInvite;
