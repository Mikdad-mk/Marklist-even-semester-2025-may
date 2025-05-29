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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { reason } = await req.json();
    const { id: teacherId } = await context.params;

    // Get admin user ID from token
    const token = req.cookies.get('auth')?.value;
    const decoded = verify(token!, JWT_SECRET) as { id: string };

    // Toggle the mark entry access
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Toggle the access
    teacher.canEnterMarks = !teacher.canEnterMarks;
    
    // Update last mark entry access info if granting access
    if (teacher.canEnterMarks) {
      teacher.lastMarkEntryAccess = {
        grantedBy: decoded.id,
        grantedAt: new Date(),
        reason: reason || 'Access granted by admin'
      };
    }

    await teacher.save();

    return NextResponse.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      canEnterMarks: teacher.canEnterMarks,
      lastMarkEntryAccess: teacher.lastMarkEntryAccess
    });
  } catch (error) {
    console.error('Error toggling mark entry access:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 