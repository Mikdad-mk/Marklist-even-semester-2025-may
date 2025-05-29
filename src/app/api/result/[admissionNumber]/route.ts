import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Mark from '@/models/Mark';

// This is a public API endpoint - no authentication required
export async function GET(
  request: Request,
  context: { params: Promise<{ admissionNumber: string }> }
) {
  try {
    await dbConnect();

    // Get the admission number from params and ensure it's a string
    const { admissionNumber } = await context.params;

    // Find student by admission number
    const student = await Student.findOne({ admissionNumber });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get all marks for the student
    const marks = await Mark.find({ studentId: student._id })
      .select('subject ce te total result')
      .sort({ subject: 1 });

    // Format the response
    const result = {
      name: student.name,
      class: student.class,
      admission_number: student.admissionNumber,
      subjects: marks.map(mark => ({
        name: mark.subject,
        ce: mark.ce,
        te: mark.te,
        total: mark.total,
        result: mark.result
      }))
    };

    // Set CORS headers to allow public access
    const response = NextResponse.json(result);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Error fetching result:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 