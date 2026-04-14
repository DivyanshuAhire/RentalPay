import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  password?: string;
  role: "USER" | "ADMIN";
  phone?: string;
  address?: string;
  walletBalance: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    phone: { type: String },
    address: { type: String },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } }
);

UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: "string" } } }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
