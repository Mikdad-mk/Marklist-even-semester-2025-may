import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import PreRegisteredTeacher from "@/models/PreRegisteredTeacher";
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

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { name, registerNumber } = body;

    // Validate input
    if (!name || !registerNumber) {
      return NextResponse.json(
        { error: "Name and register number are required" },
        { status: 400 }
      );
    }

    // Check if register number already exists
    const existing = await PreRegisteredTeacher.findOne({ registerNumber });
    if (existing) {
      return NextResponse.json(
        { error: "Register number already exists" },
        { status: 400 }
      );
    }

    // Create new pre-registered teacher
    const preRegisteredTeacher = await PreRegisteredTeacher.create({
      name,
      registerNumber,
    });

    return NextResponse.json(preRegisteredTeacher, { status: 201 });
  } catch (error) {
    console.error('Error pre-registering teacher:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get all pre-registered teachers
    const preRegisteredTeachers = await PreRegisteredTeacher.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(preRegisteredTeachers);
  } catch (error) {
    console.error('Error fetching pre-registered teachers:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 