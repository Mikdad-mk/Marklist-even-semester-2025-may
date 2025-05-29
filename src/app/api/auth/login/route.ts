import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password, registerNumber } = await req.json();

  // Defensive: trim and lowercase email, trim registerNumber
  const cleanEmail = email?.trim().toLowerCase();
  const cleanRegisterNumber = registerNumber?.trim();

  console.log("Login attempt:", { email: cleanEmail, registerNumber: cleanRegisterNumber });

  // Log user count for debugging
  const userCount = await User.countDocuments();
  console.log("Total users in collection:", userCount);

  let user;
  if (cleanRegisterNumber) {
    const query = {
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
      registerNumber: { $regex: new RegExp(`^${cleanRegisterNumber}$`, "i") }
    };
    console.log("Teacher login query:", query);
    user = await User.findOne(query);
    console.log("User found by email and registerNumber:", user);
  } else {
    const query = {
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") }
    };
    console.log("Admin login query:", query);
    user = await User.findOne(query);
    console.log("User found by email:", user);
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  // Create JWT token
  const token = sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Create the response
  const response = NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      status: user.status
    }
  });

  // Set the auth cookie
  response.cookies.set({
    name: 'auth',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 1 day
  });

  return response;
} 