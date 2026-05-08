import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyJWT } from "@/lib/jwt";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    // Auth Check
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { type, status } = body; // type: 'earning' | 'deposit'

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (type === 'earning') {
      order.ownerEarningStatus = status;
    } else if (type === 'deposit') {
      order.depositRefundStatus = status;
    } else {
      return NextResponse.json({ error: "Invalid payout type" }, { status: 400 });
    }

    await order.save();

    return NextResponse.json({ message: "Payout status updated successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
