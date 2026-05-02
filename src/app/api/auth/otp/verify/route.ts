import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { VerificationCode } from "@/models/VerificationCode";

export async function POST(req: NextRequest) {
  try {
    const { identifier, code, dontDelete } = await req.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: "Identifier and code are required." }, { status: 400 });
    }

    await dbConnect();

    const normalizedIdentifier = identifier.toString().trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);
    const destination = isEmail ? normalizedIdentifier.toLowerCase() : normalizedIdentifier;

    const record = await VerificationCode.findOne({ identifier: destination, code });

    if (!record) {
      return NextResponse.json({ error: "Invalid OTP code." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await VerificationCode.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
    }

    // Success - code matches and is valid
    if (!dontDelete) {
      await VerificationCode.deleteOne({ _id: record._id });
    }

    return NextResponse.json({ message: "Verification successful.", verified: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
