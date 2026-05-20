import mongoose, { Schema, Document, Model } from "mongoose";

export type MemberRole = "owner" | "manager" | "employee";

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["owner", "manager", "employee"], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index — one membership per user per workspace
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

const WorkspaceMember: Model<IWorkspaceMember> =
  mongoose.models.WorkspaceMember ?? mongoose.model<IWorkspaceMember>("WorkspaceMember", WorkspaceMemberSchema);
export default WorkspaceMember;
