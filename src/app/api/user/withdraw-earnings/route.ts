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

    // Find all completed orders where earnings are "Available"
    const availableOrders = await Order.find({
      ownerId: userId,
      ownerEarningStatus: "Available"
    });

    if (availableOrders.length === 0) {
      return NextResponse.json({ error: "No available earnings for withdrawal." }, { status: 400 });
    }

    const totalToWithdraw = availableOrders.reduce((sum, o) => sum + o.ownerEarning, 0);

    // Update all these orders to "Requested"
    await Order.updateMany(
      { ownerId: userId, ownerEarningStatus: "Available" },
      { ownerEarningStatus: "Requested" }
    );

    return NextResponse.json({ 
        message: `Withdrawal request for ₹${totalToWithdraw} received. It will be credited to your bank within 3-5 business days.`,
        amount: totalToWithdraw
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
