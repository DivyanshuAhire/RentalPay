import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { VerificationCode } from "@/models/VerificationCode";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, gender, address, dob, code } = await req.json();

    if (!name || !email || !password || !code) {
      return NextResponse.json({ error: "Missing required fields (including OTP code)." }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify OTP
    const verification = await VerificationCode.findOne({
      identifier: email.toLowerCase(),
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      gender,
      address,
      dob,
      role: "USER"
    });

    // Clear OTP
    await VerificationCode.deleteOne({ _id: verification._id });

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "supersecretjwtkey123",
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Registration successful",
    });

    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
