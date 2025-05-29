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
    // Check if user is admin
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get all pending teacher requests
    const requests = await User.find({
      role: 'teacher',
      isApproved: false,
      status: 'active'
    }).select('-passwordHash');

    // Transform the data for the response
    const requestData = requests.map(request => ({
      id: request._id,
      name: request.name,
      email: request.email,
      registerNumber: request.registerNumber,
      createdAt: request.createdAt
    }));

    return NextResponse.json(requestData);
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 