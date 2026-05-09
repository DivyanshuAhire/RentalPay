import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISettings extends Document {
  platformMode: "production" | "test";

  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactText?: string;
  contactInstagram?: string;
  faqs?: { question: string; answer: string }[];
}

const SettingsSchema = new Schema<ISettings>(
  {
    platformMode: { type: String, enum: ["production", "test"], default: "test" },

    contactEmail: { type: String, default: "rentalpay.in@gmail.com" },
    contactPhone: { type: String, default: "+91 0000000000" },
    contactAddress: { type: String, default: "123 Rental Street, Fashion City" },
    contactText: { type: String, default: "We'd love to hear from you. Drop us a line!" },
    contactInstagram: { type: String, default: "@rentalpay" },
    faqs: [{ question: String, answer: String }]
  },
  { timestamps: true }
);

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}
export const Settings: Model<ISettings> = mongoose.model<ISettings>("Settings", SettingsSchema);
