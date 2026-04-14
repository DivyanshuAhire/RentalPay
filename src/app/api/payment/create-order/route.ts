import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    await dbConnect();

    const order = await Order.findById(orderId).populate("renterId");
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // BYPASS FOR TESTER SIMULATION
    const renter = order.renterId as any;
    const renterEmail = renter?.email?.toString().toLowerCase();
    const renterName = renter?.name?.toString().trim().toLowerCase();
    if (renterEmail === "tester@stylep2p.com" || renterName === "tester") {
      order.razorpayOrderId = "mock_order_" + order._id;
      await order.save();
      return NextResponse.json({ 
        id: order.razorpayOrderId, 
        currency: "INR", 
        amount: Math.round(order.totalPrice * 100) 
      }, { status: 200 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(order.totalPrice * 100);
    const ownerEarningInPaise = Math.round((order.ownerEarning + order.securityDeposit) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}`,
      transfers: [
        {
          account: "acc_placeholderForOwner", // Fetched from user profile connected account in production
          amount: ownerEarningInPaise,
          currency: "INR",
          notes: {
            reason: "P2P Rental Payment",
          },
          on_hold: false
        }
      ]
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({ id: razorpayOrder.id, currency: razorpayOrder.currency, amount: razorpayOrder.amount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
