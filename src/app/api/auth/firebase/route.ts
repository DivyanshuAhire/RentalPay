import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User as UserModel } from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, name, phone, gender, address, dob, isLogin } = await req.json();
    
    if (!uid || (!email && !phone)) {
      return NextResponse.json({ error: "Missing Firebase user info." }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    let user = await UserModel.findOne({ firebaseUids: uid });
    if (!user && email) {
      user = await UserModel.findOne({ email: email.toLowerCase() });
    }
    if (!user && phone) {
      user = await UserModel.findOne({ phone });
    }
    
    if (!user) {
      if (isLogin) {
        return NextResponse.json({ error: "User not found. Please sign up.", redirectToSignup: true }, { status: 404 });
      }
      // Create new user
      const finalName = name && name !== "User" ? name : (email ? email.split("@")[0] : "User");
      user = await UserModel.create({
        name: finalName,
        email: email ? email.toLowerCase() : undefined,
        phone,
        gender,
        address,
        dob,
        firebaseUids: [uid],
        role: "USER",
      });
    } else {
      // Ensure firebaseUids array exists. Add UID if not present.
      if (!user.firebaseUids) {
        user.firebaseUids = [];
      }
      if (!user.firebaseUids.includes(uid)) {
        user.firebaseUids.push(uid);
        await user.save();
      }
      
      // Update with new details if provided
      let updated = false;
      if (email && !user.email) { user.email = email.toLowerCase(); updated = true; }
      if (phone && !user.phone) { user.phone = phone; updated = true; }
      if (gender && !user.gender) { user.gender = gender; updated = true; }
      if (address && !user.address) { user.address = address; updated = true; }
      if (dob && !user.dob) { user.dob = dob; updated = true; }
      if (name && user.name !== name && name !== "User") { user.name = name; updated = true; }
      
      if (updated) {
        await user.save();
      }
    }

    // Issue JWT — use "auth-token" to match all other API routes
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
        phone: user.phone,
        role: user.role,
      },
      message: "Sync successful",
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
