import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISettings extends Document {
  platformMode: "production" | "test";
  bannerMessage: string;
  showBanner: boolean;
  disablePhoneAuth: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    platformMode: { type: String, enum: ["production", "test"], default: "test" },
    bannerMessage: { type: String, default: "SITE IS UNDER TESTING • TRY MAKING PAYMENT WITHOUT REAL MONEY" },
    showBanner: { type: Boolean, default: true },
    disablePhoneAuth: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}
export const Settings: Model<ISettings> = mongoose.model<ISettings>("Settings", SettingsSchema);
