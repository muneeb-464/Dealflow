import mongoose, { Schema, Document, Model } from "mongoose";

export type RevenueType = "payment_received" | "refund" | "bonus" | "other";

export interface IRevenue extends Document {
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;

  clientId?: mongoose.Types.ObjectId;
  clientName?: string;              // denormalized
  orderId?: mongoose.Types.ObjectId;

  type: RevenueType;
  amount: number;
  currency: string;
  amountUSD?: number;               // converted value for analytics (set on create)

  description?: string;
  receivedAt: Date;
  platform?: string;

  createdAt: Date;
  updatedAt: Date;
}

const RevenueSchema = new Schema<IRevenue>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    clientName: { type: String },
    orderId: { type: Schema.Types.ObjectId },

    type: { type: String, enum: ["payment_received", "refund", "bonus", "other"], default: "payment_received" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    amountUSD: { type: Number },

    description: { type: String },
    receivedAt: { type: Date, default: Date.now, index: true },
    platform: { type: String },
  },
  { timestamps: true }
);

// Analytics queries: workspace + date range
RevenueSchema.index({ workspaceId: 1, receivedAt: -1 });
RevenueSchema.index({ workspaceId: 1, clientId: 1 });

const Revenue: Model<IRevenue> = mongoose.models.Revenue ?? mongoose.model<IRevenue>("Revenue", RevenueSchema);
export default Revenue;
