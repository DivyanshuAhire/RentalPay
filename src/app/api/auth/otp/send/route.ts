import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { VerificationCode } from "@/models/VerificationCode";
import { sendEmailOTP } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Email or phone is required." }, { status: 400 });
    }

    await dbConnect();

    const normalizedIdentifier = identifier.toString().trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);
    const destination = isEmail ? normalizedIdentifier.toLowerCase() : normalizedIdentifier;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await VerificationCode.findOneAndUpdate(
      { identifier: destination },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    if (isEmail) {
      await sendEmailOTP(destination, code);
    } else {
      await sendWhatsAppOTP(destination, code);
    }

    return NextResponse.json({ message: `OTP sent successfully via ${isEmail ? "email" : "WhatsApp"}.` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
