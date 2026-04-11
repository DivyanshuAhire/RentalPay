import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Listing } from "@/models/Listing";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const size = searchParams.get("size");

    let query: any = {};
    if (category && category !== "All") query.category = category;
    if (size && size !== "All") query.size = size;

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
      availabilityDates: availabilityDates || []
    });

    return NextResponse.json({ message: "Listing created", listing: newListing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
