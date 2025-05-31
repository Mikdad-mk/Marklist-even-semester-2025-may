import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { verify } from "jsonwebtoken";
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get('auth')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    // Validate the teacher ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid teacher ID format' }, { status: 400 });
    }

    // Delete the teacher using the User model
    const result = await User.findOneAndDelete({
      _id: id,
      role: 'teacher', // Extra safety check to ensure we're only deleting teachers
    });

    if (!result) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Also delete any related data (like mark entries) if needed
    // await mongoose.connection.collection('marks').deleteMany({ teacherId: new mongoose.Types.ObjectId(id) });

    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 