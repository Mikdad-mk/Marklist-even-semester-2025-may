import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Mark, { IMark } from "@/models/Mark";
import Student, { IStudent } from "@/models/Student";
import { appendToSheet, MarkData } from "@/lib/googleSheets";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to check if user is an approved teacher with mark entry access
async function isTeacherWithMarkAccess(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return false;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      isApproved: boolean;
    };

    if (decoded.role !== 'teacher' || !decoded.isApproved) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isTeacherWithMarkAccess(req)) {
      return NextResponse.json(
        { error: "You don't have permission to enter marks at this time" },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await req.json();

    // Validate required fields
    if (!data.studentId || !data.subject || !data.ce || !data.te) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, subject, ce, and te are required" },
        { status: 400 }
      );
    }

    // Validate CE and TE marks
    const ce = Number(data.ce);
    const te = Number(data.te);

    if (isNaN(ce) || ce < 0 || ce > 30) {
      return NextResponse.json(
        { error: "CE marks must be between 0 and 30" },
        { status: 400 }
      );
    }

    if (isNaN(te) || te < 0 || te > 70) {
      return NextResponse.json(
        { error: "TE marks must be between 0 and 70" },
        { status: 400 }
      );
    }

    // Get student details first
    const student = await Student.findById<IStudent>(data.studentId);
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check for duplicate entry
    const existingMark = await Mark.findOne<IMark>({
      studentId: data.studentId,
      subject: data.subject
    });

    if (existingMark) {
      return NextResponse.json(
        { error: "Mark entry already exists for this student and subject" },
        { status: 400 }
      );
    }

    // Calculate total and result
    const total = ce + te;
    const result = (total >= 40 ? 'Pass' : 'Fail') as 'Pass' | 'Fail';

    // Create mark in MongoDB
    const mark = await Mark.create<IMark>({
      studentId: data.studentId,
      subject: data.subject,
      ce,
      te,
      total,
      result
    });

    // Prepare data for Google Sheets
    const sheetData: MarkData = {
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      class: student.class || 'N/A',
      subject: data.subject,
      ce,
      te,
      total,
      result,
      submittedAt: new Date().toISOString()
    };

    // Append to Google Sheets
    try {
      await appendToSheet(sheetData);
    } catch (error) {
      console.error('Failed to append to Google Sheets:', error);
      // Don't fail the request if Google Sheets sync fails
    }

    return NextResponse.json(mark);
  } catch (error: any) {
    console.error('Error creating mark:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Mark entry already exists for this student and subject" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create mark entry" },
      { status: 500 }
    );
  }
} 