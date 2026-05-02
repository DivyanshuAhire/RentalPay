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

    const { status } = await req.json();
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const listing = await Listing.findByIdAndUpdate(id, { status }, { new: true }).populate("ownerId");
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Send notification email to owner
    const owner: any = listing.ownerId;
    if (owner && owner.email) {
      const subject = status === "approved" ? "Listing Approved - StyleP2P" : "Listing Rejected - StyleP2P";
      const message = status === "approved" 
        ? `Hi ${owner.name},\n\nGreat news! Your listing "${listing.title}" has been approved and is now visible to the public.\n\nBest regards,\nStyleP2P Team`
        : `Hi ${owner.name},\n\nWe regret to inform you that your listing "${listing.title}" has been rejected during our review process. If you have any questions, please contact support.\n\nBest regards,\nStyleP2P Team`;
      
      await sendNotificationEmail(owner.email, subject, message);
    }

    return NextResponse.json({ message: `Listing ${status}`, listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
