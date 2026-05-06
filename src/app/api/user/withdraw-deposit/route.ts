import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = payload.id;

    const body = await req.json();
    const { orderId } = body;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Security check: Only the renter can request refund
    if (order.renterId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden. Not your order." }, { status: 403 });
    }

    if (order.depositRefundStatus !== "Available") {
      return NextResponse.json({ error: "Deposit is not available for withdrawal yet." }, { status: 400 });
    }

    order.depositRefundStatus = "Requested";
    await order.save();

    // In a real app, this would trigger a payout or transfer. 
    // For now, we simulate success.
    
    return NextResponse.json({ 
        message: "Withdrawal request received. Your deposit of ₹" + order.securityDeposit + " will be credited to your bank within 3-5 business days.",
        order 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
