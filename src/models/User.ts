import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;           // Clerk's userId — primary link
  email: string;
  name: string;
  avatar?: string;
  activeWorkspaceId?: mongoose.Types.ObjectId;
  hasDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    activeWorkspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    hasDemoData: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default User;
