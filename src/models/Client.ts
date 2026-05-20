import mongoose, { Schema, Document, Model } from "mongoose";

export type ClientStatus = "active" | "inactive" | "churned";
export type OrderStatus = "in_progress" | "completed" | "cancelled" | "on_hold";

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface IClient extends Document {
  workspaceId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  convertedFromLead?: mongoose.Types.ObjectId;  // ref Lead

  // Client info
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  avatar?: string;
  platform: string;

  status: ClientStatus;
  totalRevenue: number;    // denormalized sum — updated on order change
  currency: string;
  tags: string[];
  notes?: string;

  orders: IOrder[];        // embedded sub-documents

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["in_progress", "completed", "cancelled", "on_hold"], default: "in_progress" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    notes: { type: String },
  },
  { _id: true }
);

const ClientSchema = new Schema<IClient>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    convertedFromLead: { type: Schema.Types.ObjectId, ref: "Lead" },

    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    country: { type: String },
    avatar: { type: String },
    platform: { type: String, default: "direct" },

    status: { type: String, enum: ["active", "inactive", "churned"], default: "active", index: true },
    totalRevenue: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    tags: [{ type: String }],
    notes: { type: String },

    orders: [OrderSchema],
  },
  { timestamps: true }
);

ClientSchema.index({ workspaceId: 1, status: 1 });
ClientSchema.index({ workspaceId: 1, assignedTo: 1 });

const Client: Model<IClient> = mongoose.models.Client ?? mongoose.model<IClient>("Client", ClientSchema);
export default Client;
