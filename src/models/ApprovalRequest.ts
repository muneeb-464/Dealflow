import mongoose, { Schema, Document, Model } from "mongoose";

export type ApprovalRequestType = "delete_lead" | "bulk_update_leads" | "delete_client";
export type ApprovalRequestStatus = "pending" | "approved" | "rejected";

export interface IApprovalRequest extends Document {
  workspaceId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  type: ApprovalRequestType;
  targetId?: string;
  targetLabel?: string;
  note?: string;
  status: ApprovalRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

const ApprovalRequestSchema = new Schema<IApprovalRequest>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["delete_lead", "bulk_update_leads", "delete_client"], required: true },
    targetId: { type: String },
    targetLabel: { type: String },
    note: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const ApprovalRequest: Model<IApprovalRequest> =
  mongoose.models.ApprovalRequest ?? mongoose.model<IApprovalRequest>("ApprovalRequest", ApprovalRequestSchema);
export default ApprovalRequest;
