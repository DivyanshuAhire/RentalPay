import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";
import { sendNotificationEmail } from "@/lib/email";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const size = searchParams.get("size");
    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status");

    let query: any = {};
    if (category && category !== "All") query.category = category;
    if (size && size !== "All") query.size = size;
    if (ownerId) query.ownerId = ownerId;
    
    // By default, only show approved listings. 
    // If ownerId is provided, show all their listings (for their dashboard).
    // If status is provided specifically (e.g. for admin), use that.
    if (!ownerId && !status) {
      query.status = "approved";
    } else if (status && status !== "all") {
      query.status = status;
    }
    // if status is "all", we don't add status to query, showing everything.

    const listings = await Listing.find(query).populate("ownerId", "name email");
    return NextResponse.json(listings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { ownerId, title, description, category, size, pricePerDay, deposit, images, availabilityDates, location } = body;

    const newListing = await Listing.create({
      ownerId,
      title,
      description,
      category,
      size,
      pricePerDay,
      deposit,
      location,
      images: images || [],
      availabilityDates: availabilityDates || [],
      status: "pending"
    });

    // Send notification email to owner
    const owner = await User.findById(ownerId);
    if (owner && owner.email) {
      await sendNotificationEmail(
        owner.email,
        "Listing Received - StyleP2P",
        `Hi ${owner.name},\n\nYour listing "${title}" has been received and is currently under review by our team. You will be notified once it is approved and public.\n\nBest regards,\nStyleP2P Team`
      );
    }

    return NextResponse.json({ message: "Listing created and sent for review", listing: newListing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
