import mongoose, { Schema, Document, Model } from "mongoose";

export type LeadStatus = "sent" | "pending" | "followup_due" | "replied" | "converted" | "rejected";
export type LeadPlatform = "upwork" | "fiverr" | "linkedin" | "direct" | "referral" | "whatsapp" | "other";
export type LostReason = "budget_issue" | "no_fit" | "no_reply" | "went_with_competitor" | "project_cancelled" | "other";

export interface ILead extends Document {
  workspaceId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;      // User
  createdBy: mongoose.Types.ObjectId;       // User

  // Lead info
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  platform: LeadPlatform;
  serviceOffered: string;
  proposedAmount: number;
  currency: string;
  notes?: string;

  // Pipeline
  status: LeadStatus;
  leadSentAt: Date;
  repliedAt?: Date;
  convertedAt?: Date;
  lostReason?: LostReason;

  // Follow-up tracking
  followUpCount: number;
  lastFollowUpAt?: Date;
  nextFollowUpAt?: Date;       // set by cron after 48h no reply

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, lowercase: true, trim: true },
    clientCompany: { type: String, trim: true },
    platform: { type: String, enum: ["upwork", "fiverr", "linkedin", "direct", "referral", "whatsapp", "other"], required: true },
    serviceOffered: { type: String, required: true, trim: true },
    proposedAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    notes: { type: String },

    status: {
      type: String,
      enum: ["sent", "pending", "followup_due", "replied", "converted", "rejected"],
      default: "sent",
      index: true,
    },
    leadSentAt: { type: Date, default: Date.now },
    repliedAt: { type: Date },
    convertedAt: { type: Date },
    lostReason: { type: String, enum: ["budget_issue", "no_fit", "no_reply", "went_with_competitor", "project_cancelled", "other"] },

    followUpCount: { type: Number, default: 0 },
    lastFollowUpAt: { type: Date },
    nextFollowUpAt: { type: Date, index: true },  // indexed for cron query
  },
  { timestamps: true }
);

// Compound index for common dashboard query: workspace + status
LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, assignedTo: 1, status: 1 });

const Lead: Model<ILead> = mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);
export default Lead;
