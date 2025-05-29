import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to check if user is admin
async function isAdmin(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return false;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get all teachers (both approved and pending)
    const teachers = await User.find({
      role: 'teacher'
    }).select('-passwordHash');

    // Transform the data for the response
    const teacherData = teachers.map(teacher => ({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      registerNumber: teacher.registerNumber,
      isApproved: teacher.isApproved,
      canEnterMarks: teacher.canEnterMarks,
      lastMarkEntryAccess: teacher.lastMarkEntryAccess,
      status: teacher.status
    }));

    return NextResponse.json(teacherData);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
} 