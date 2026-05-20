import mongoose, { Schema, Document, Model } from "mongoose";

export type GrantablePage = "revenue" | "analytics" | "team" | "settings";
export type GrantStatus = "pending" | "approved" | "rejected";

export interface IPageAccessGrant extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  page: GrantablePage;
  status: GrantStatus;
  requestNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

const PageAccessGrantSchema = new Schema<IPageAccessGrant>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    page:        { type: String, enum: ["revenue", "analytics", "team", "settings"], required: true },
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    requestNote: { type: String },
    reviewedBy:  { type: Schema.Types.ObjectId, ref: "User" },
    reviewNote:  { type: String },
    reviewedAt:  { type: Date },
  },
  { timestamps: true }
);

// One request per user per page per workspace
PageAccessGrantSchema.index({ workspaceId: 1, userId: 1, page: 1 }, { unique: true });

const PageAccessGrant: Model<IPageAccessGrant> =
  mongoose.models.PageAccessGrant ?? mongoose.model<IPageAccessGrant>("PageAccessGrant", PageAccessGrantSchema);
export default PageAccessGrant;
