import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  password?: string;
  role: "USER" | "ADMIN" | "TESTER";
  phone?: string;
  address?: string;
  gender?: string;
  dob?: Date;
  walletBalance: number;
  googleId?: string;
  firebaseUids?: string[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    beneficiaryName: string;
  };
  upiId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["USER", "ADMIN", "TESTER"], default: "USER" },
    phone: { type: String },
    address: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
    dob: { type: Date },
    walletBalance: { type: Number, default: 0 },
    googleId: { type: String },
    firebaseUids: [{ type: String }],
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      beneficiaryName: { type: String },
    },
    upiId: { type: String },
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

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
