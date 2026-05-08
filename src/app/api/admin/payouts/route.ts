import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyJWT } from "@/lib/jwt";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Auth Check
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await Order.find({
      $or: [
        { ownerEarningStatus: "Requested" },
        { depositRefundStatus: "Requested" }
      ]
    })
    .populate("ownerId", "name email bankDetails upiId")
    .populate("renterId", "name email bankDetails upiId")
    .populate("listingId", "title")
    .sort({ updatedAt: -1 });

    return NextResponse.json(requests, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
