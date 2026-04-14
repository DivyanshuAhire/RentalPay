import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, identifier, password, address } = body;

    if (!name || !identifier || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedIdentifier = identifier.toString().trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

    const existingUser = await User.findOne({
      $or: [
        { phone: normalizedIdentifier },
        { email: isEmail ? normalizedIdentifier.toLowerCase() : undefined },
      ].filter(Boolean),
    });
    if (existingUser) {
      return NextResponse.json({ error: "This email or phone is already registered" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      password: hashedPassword,
      role: "USER",
      email: isEmail ? normalizedIdentifier.toLowerCase() : undefined,
      phone: isEmail ? undefined : normalizedIdentifier,
      address,
    });

    const token = signToken({ id: user._id, role: user.role, phone: user.phone, email: user.email });

    const response = NextResponse.json(
      { message: "Registration successful", user: { id: user._id, email: user.email, phone: user.phone, role: user.role, name: user.name } },
      { status: 201 }
    );
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
