import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { VerificationCode } from "@/models/VerificationCode";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { identifier, code, newPassword } = await req.json();

    if (!identifier || !code || !newPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify OTP
    const verification = await VerificationCode.findOne({
      identifier: identifier.toString().toLowerCase(),
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // 2. Update MongoDB Password
    const user = await User.findOne({ email: identifier.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // 3. Clear OTP
    await VerificationCode.deleteOne({ _id: verification._id });

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
