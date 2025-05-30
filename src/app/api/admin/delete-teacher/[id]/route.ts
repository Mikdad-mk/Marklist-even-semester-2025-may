import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth')?.value;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the JWT token
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      isApproved: boolean;
    };

    // Check if user is an admin
    if (decoded.role !== 'admin' || !decoded.isApproved) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    const { id } = params;

    // Delete the teacher
    const result = await mongoose.connection.collection('users').deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      role: 'teacher', // Extra safety check to ensure we're only deleting teachers
    });

    if (result.deletedCount === 0) {
      return new NextResponse('Teacher not found', { status: 404 });
    }

    // Also delete any related data (like mark entries) if needed
    // await mongoose.connection.collection('marks').deleteMany({ teacherId: new mongoose.Types.ObjectId(id) });

    return new NextResponse('Teacher deleted successfully', { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return new NextResponse('Invalid token', { status: 401 });
    }
    console.error('Error deleting teacher:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 