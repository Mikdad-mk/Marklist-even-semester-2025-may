import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Mark from "@/models/Mark";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to check if user is an approved teacher
async function isApprovedTeacher(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return false;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      isApproved: boolean;
    };
    return decoded.role === 'teacher' && decoded.isApproved;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    // Check if user is an approved teacher
    if (!await isApprovedTeacher(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get marks for the student
    const { studentId } = await context.params;
    const marks = await Mark.find({ studentId })
      .sort({ subject: 1 });

    return NextResponse.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 