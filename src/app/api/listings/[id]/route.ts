import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";
import { Order } from "@/models/Order";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey123";


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const listing = await Listing.findById(resolvedParams.id).populate("ownerId", "name email phone");
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fetch confirmed bookings to show availability
    const bookings = await Order.find({
      listingId: resolvedParams.id,
      status: { $in: ["Pending", "Accepted", "Ongoing", "Delivered", "Returned", "Completed"] },
      paymentStatus: "Paid"
    }).select("startDate endDate");

    return NextResponse.json({
      ...listing.toObject(),
      bookedDates: bookings
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const body = await req.json();
    const resolvedParams = await params;
    const updatedListing = await Listing.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    return NextResponse.json({ message: "Listing updated", listing: updatedListing }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;

    // Auth check
    const token = (req as any).cookies?.get("auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let userId: string;
    let userRole: string;
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      userId = payload.id as string;
      userRole = payload.role as string;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await Listing.findById(resolvedParams.id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Verify ownership or admin role
    if (listing.ownerId.toString() !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to delete this listing" }, { status: 403 });
    }

    await Listing.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ message: "Listing deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
