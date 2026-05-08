import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { sendNotificationEmail } from "@/lib/email";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const adminId = payload.id as string;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { status, title, description, category, size, gender, pricePerDay, deposit, comment } = await req.json();
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (size) updateData.size = size;
    if (gender) updateData.gender = gender;
    if (pricePerDay !== undefined) updateData.pricePerDay = Number(pricePerDay);
    if (deposit !== undefined) updateData.deposit = Number(deposit);

    const listing = await Listing.findByIdAndUpdate(id, updateData, { new: true }).populate("ownerId");
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Send notification email to owner
    const owner: any = listing.ownerId;
    if (owner && owner.email) {
      let subject = "";
      let message = "";

      const isStatusOnly = status && !title && !description && !category && !size && !gender && pricePerDay === undefined && deposit === undefined;

      if (isStatusOnly) {
        subject = status === "approved" ? "Listing Approved - RentalPay" : "Listing Rejected - RentalPay";
        message = status === "approved"
          ? `Hi ${owner.name},\n\nGreat news! Your listing "${listing.title}" has been approved and is now visible to the public.\n\n${comment ? `Admin Message: ${comment}\n\n` : ""}Best regards,\nRentalPay Team`
          : `Hi ${owner.name},\n\nWe regret to inform you that your listing "${listing.title}" has been rejected during our review process.\n\n${comment ? `Admin Message: ${comment}\n\n` : ""}If you have any questions, please contact support.\n\nBest regards,\nRentalPay Team`;
      } else {
        const changedFields = Object.keys(updateData).filter(k => k !== 'status');
        subject = "Listing Details Updated - RentalPay";
        message = `Hi ${owner.name},\n\nOur moderation team has updated your listing "${listing.title}".\n\nThe following fields were updated: ${changedFields.join(", ")}.\n\n${comment ? `Admin Message: ${comment}\n\n` : ""}These changes were made to maintain platform quality standards.\n\nBest regards,\nRentalPay Team`;
      }

      await sendNotificationEmail(owner.email, subject, message);
    }

    return NextResponse.json({ message: `Listing ${status}`, listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
