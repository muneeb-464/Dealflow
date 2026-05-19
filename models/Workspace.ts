import mongoose, { Schema, Document, Model } from "mongoose";

export type WorkspacePlan = "free" | "pro" | "enterprise";
export type WorkspaceCurrency = "USD" | "PKR" | "EUR" | "GBP" | "AED" | "CAD" | "AUD";

export interface IWorkspace extends Document {
  name: string;
  slug: string;              // unique URL-safe identifier
  logo?: string;
  ownerId: mongoose.Types.ObjectId;  // ref User
  plan: WorkspacePlan;
  currency: WorkspaceCurrency;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    logo: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    currency: { type: String, enum: ["USD", "PKR", "EUR", "GBP", "AED", "CAD", "AUD"], default: "USD" },
    timezone: { type: String, default: "Asia/Karachi" },
  },
  { timestamps: true }
);

const Workspace: Model<IWorkspace> = mongoose.models.Workspace ?? mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);
export default Workspace;
