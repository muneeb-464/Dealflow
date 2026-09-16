import mongoose, { Schema, Document, Model } from "mongoose";
import { LEAD_STATUSES, LEAD_PLATFORMS } from "@/constants/leads";

export type LeadStatus = "sent" | "pending" | "followup_due" | "replied" | "converted" | "rejected" | "dead";
export type LeadPlatform = "upwork" | "fiverr" | "linkedin" | "direct" | "referral" | "whatsapp" | "cold_email" | "other";
export type LostReason = "budget_issue" | "no_fit" | "no_reply" | "went_with_competitor" | "project_cancelled" | "other";

export interface ILead extends Document {
  workspaceId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;      // User
  createdBy: mongoose.Types.ObjectId;       // User

  // Lead info
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  email: string;               // the lead's own address — what outreach automation sends to. "" = none
  platform: LeadPlatform;
  campaign: string;            // outreach batch this lead came from, e.g. "AI system". "" = none
  serviceOffered: string;
  proposedAmount?: number;     // legacy — the UI no longer asks for a price
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
  nextFollowUpAt?: Date;       // not set by anything yet (no cron)

  isDemoData: boolean;

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
    email: { type: String, trim: true, lowercase: true, default: "" },
    platform: { type: String, enum: LEAD_PLATFORMS, required: true },
    campaign: { type: String, trim: true, default: "" },
    serviceOffered: { type: String, required: true, trim: true },
    proposedAmount: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    notes: { type: String },

    status: {
      type: String,
      enum: LEAD_STATUSES,
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
    isDemoData: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for common dashboard query: workspace + status
LeadSchema.index({ workspaceId: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, assignedTo: 1, status: 1 });
LeadSchema.index({ workspaceId: 1, campaign: 1 });

const Lead: Model<ILead> = mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);
export default Lead;
