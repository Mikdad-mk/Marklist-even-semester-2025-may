import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Mark from "@/models/Mark";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to check if user is an approved teacher with mark entry access
async function isTeacherWithMarkAccess(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return false;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      isApproved: boolean;
    };

    if (decoded.role !== 'teacher' || !decoded.isApproved) {
      return false;
    }

    await dbConnect();
    const user = await User.findById(decoded.id);
    return user?.canEnterMarks || false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isTeacherWithMarkAccess(req)) {
      return NextResponse.json(
        { error: "You don't have permission to enter marks at this time" },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await req.json();
    const mark = await Mark.create(data);

    return NextResponse.json(mark);
  } catch (error) {
    console.error('Error creating mark:', error);
    return NextResponse.json(
      { error: "Failed to create mark entry" },
      { status: 500 }
    );
  }
} 