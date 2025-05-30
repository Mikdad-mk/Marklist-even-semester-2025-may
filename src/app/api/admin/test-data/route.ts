import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Mark from '@/models/Mark';

export async function GET() {
  try {
    await dbConnect();

    // Get a sample of students
    const students = await Student.find().limit(5);
    console.log('Sample Students:', JSON.stringify(students, null, 2));

    // Get a sample of marks
    const marks = await Mark.find().limit(5);
    console.log('Sample Marks:', JSON.stringify(marks, null, 2));

    // Get distinct student IDs from marks
    const distinctStudentIds = await Mark.distinct('studentId');
    console.log('Distinct Student IDs in Marks:', distinctStudentIds);

    return NextResponse.json({
      studentCount: await Student.countDocuments(),
      markCount: await Mark.countDocuments(),
      sampleStudents: students,
      sampleMarks: marks,
      distinctStudentCount: distinctStudentIds.length
    });
  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    );
  }
} 