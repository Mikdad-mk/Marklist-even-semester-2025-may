import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Student from '@/models/Student';

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

// GET endpoint to fetch students by class
export async function GET(req: NextRequest) {
  try {
    // Check if user is an approved teacher
    if (!await isApprovedTeacher(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Get class from query params
    const { searchParams } = new URL(req.url);
    const classParam = searchParams.get('class');

    if (!classParam) {
      return NextResponse.json({ error: 'Class parameter is required' }, { status: 400 });
    }

    const students = await Student.find({ class: classParam });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST endpoint to create a new student
export async function POST(req: NextRequest) {
  try {
    // Check if user is an approved teacher
    if (!await isApprovedTeacher(req)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.admissionNumber || !body.class) {
      return NextResponse.json({ 
        error: 'Name, admission number, and class are required' 
      }, { status: 400 });
    }

    // Check if student with same admission number already exists
    const existingStudent = await Student.findOne({ 
      admissionNumber: body.admissionNumber 
    });

    if (existingStudent) {
      return NextResponse.json({ 
        error: 'Student with this admission number already exists',
        id: existingStudent._id // Return existing student ID
      }, { status: 200 });
    }

    // Create new student
    const student = new Student({
      name: body.name,
      admissionNumber: body.admissionNumber,
      class: body.class,
      academicYear: new Date().getFullYear().toString(), // Add current year as academic year
    });

    await student.save();

    return NextResponse.json({ 
      message: 'Student created successfully',
      id: student._id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
} 