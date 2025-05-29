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

    const { id: teacherId } = await context.params;

    // Get admin user ID from token
    const token = req.cookies.get('auth')?.value;
    const decoded = verify(token!, JWT_SECRET) as { id: string };

    // Update the teacher's status
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Approve the teacher and grant initial mark entry access
    teacher.isApproved = true;
    teacher.canEnterMarks = true; // Grant initial mark entry access
    teacher.lastMarkEntryAccess = {
      grantedBy: decoded.id,
      grantedAt: new Date(),
      reason: 'Initial access granted upon approval'
    };
    teacher.status = 'active';

    await teacher.save();

    return NextResponse.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      isApproved: teacher.isApproved,
      canEnterMarks: teacher.canEnterMarks,
      lastMarkEntryAccess: teacher.lastMarkEntryAccess
    });
  } catch (error) {
    console.error('Error approving teacher:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 