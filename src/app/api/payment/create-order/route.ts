import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    await dbConnect();

    const order = await Order.findById(orderId).populate("renterId");
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const renter = order.renterId as any;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(order.totalPrice * 100);
    
    const owner = await User.findById(order.ownerId);

    const options: any = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    // If owner has a linked Razorpay account, setup the transfer (on hold)
    if (owner?.razorpayAccountId) {
      options.transfers = [
        {
          account: owner.razorpayAccountId,
          amount: Math.round(order.ownerEarning * 100),
          currency: "INR",
          notes: {
            reason: "Rental Payment",
            orderId: order._id.toString()
          },
          on_hold: true // Keep money with platform until rental is successful
        }
      ];
    }

    const razorpayOrder = await razorpay.orders.create(options);
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({ id: razorpayOrder.id, currency: razorpayOrder.currency, amount: razorpayOrder.amount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
