import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedIdentifier = identifier.toString().trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

    const user = await User.findOne({
      $or: [
        { phone: normalizedIdentifier },
        { email: isEmail ? normalizedIdentifier.toLowerCase() : normalizedIdentifier },
        { name: normalizedIdentifier },
      ],
    });
    if (!user || (user.password && !(await bcrypt.compare(password, user.password)))) {
       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ id: user._id, role: user.role, phone: user.phone, email: user.email });

    const response = NextResponse.json(
      { message: "Login successful", user: { id: user._id, email: user.email, phone: user.phone, role: user.role, name: user.name } },
      { status: 200 }
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
