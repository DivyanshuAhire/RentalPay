import mongoose, { Document, Model, Schema } from "mongoose";

export interface IListing extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  size: "S" | "M" | "L" | "XL";
  pricePerDay: number;
  deposit: number;
  images: string[];
  availabilityDates: Date[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: "pending" | "approved" | "rejected";
}

const ListingSchema = new Schema<IListing>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
    pricePerDay: { type: Number, required: true },
    deposit: { type: Number, required: true },
    images: [{ type: String }],
    availabilityDates: [{ type: Date }],
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export const Listing: Model<IListing> = mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
