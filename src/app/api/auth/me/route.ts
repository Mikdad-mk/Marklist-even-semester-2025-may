import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      isApproved: boolean;
    };

    await dbConnect();

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      registerNumber: user.registerNumber,
      status: user.status,
      canEnterMarks: user.canEnterMarks,
      lastMarkEntryAccess: user.lastMarkEntryAccess
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
} 