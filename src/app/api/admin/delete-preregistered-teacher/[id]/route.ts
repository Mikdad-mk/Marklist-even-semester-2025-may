import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { verify } from "jsonwebtoken";
import PreRegisteredTeacher from '@/models/PreRegisteredTeacher';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
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

    // Get the ID from context params
    const teacherId = context.params.id;

    // Delete the pre-registered teacher using the model
    const result = await PreRegisteredTeacher.findByIdAndDelete(teacherId);

    if (!result) {
      return new NextResponse('Pre-registered teacher not found', { status: 404 });
    }

    return new NextResponse('Pre-registered teacher deleted successfully', { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return new NextResponse('Invalid token', { status: 401 });
    }
    console.error('Error deleting pre-registered teacher:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 