import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from 'mongoose';

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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // First await the params
    const { id } = await context.params;

    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await req.json();
    const { status } = data;

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate ID format using the extracted id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid teacher ID format" },
        { status: 400 }
      );
    }

    const teacher = await User.findById(id).exec();
    
    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    if (teacher.role !== 'teacher') {
      return NextResponse.json(
        { error: "User is not a teacher" },
        { status: 400 }
      );
    }

    // Update teacher status
    teacher.status = status;
    await teacher.save();

    return NextResponse.json({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      status: teacher.status,
      message: `Teacher account ${status === 'inactive' ? 'disabled' : 'enabled'} successfully`
    });
  } catch (error) {
    console.error('Error updating teacher status:', error);
    return NextResponse.json(
      { error: "Failed to update teacher status" },
      { status: 500 }
    );
  }
} 