import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Mark, { IMark } from "@/models/Mark";
import Student, { IStudent } from "@/models/Student";
import { appendToSheet, MarkData } from "@/lib/googleSheets";
import { Document } from 'mongoose';
import User from "@/models/User";

type StudentDocument = Document & IStudent;

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

    // Check if teacher account is active
    const teacher = await User.findById(decoded.id);
    if (!teacher || teacher.status === 'inactive') {
      return false;
    }

    return decoded;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await isTeacherWithMarkAccess(req);
    if (!teacher) {
      return NextResponse.json(
        { error: "You don't have permission to enter marks. Your account may be inactive or restricted." },
        { status: 403 }
      );
    }

    await dbConnect();

    const data = await req.json();

    // Validate required fields
    if (!data.studentName || !data.admissionNumber || !data.class || !data.subject || !data.ce || !data.te) {
      return NextResponse.json(
        { error: "Missing required fields: studentName, admissionNumber, class, subject, ce, and te are required" },
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

    // Find or create student
    let student = await Student.findOne({
      admissionNumber: data.admissionNumber.trim()
    }).exec() as StudentDocument | null;

    if (!student) {
      // Create new student if not found
      student = (await Student.create({
        name: data.studentName.trim(),
        class: data.class,
        admissionNumber: data.admissionNumber.trim()
      })) as StudentDocument;
    } else {
      // Update student name and class if they've changed
      if (student.name !== data.studentName.trim() || student.class !== data.class) {
        student.name = data.studentName.trim();
        student.class = data.class;
        await student.save();
      }
    }

    // Ensure we have a valid student at this point
    if (!student) {
      return NextResponse.json(
        { error: "Failed to create or update student record" },
        { status: 500 }
      );
    }

    // Check for duplicate entry
    const existingMark = await Mark.findOne<IMark>({
      studentId: student._id,
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

    // Create mark in MongoDB with teacherId
    const mark = await Mark.create<IMark>({
      studentId: student._id,
      teacherId: teacher.id,
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

    return NextResponse.json({ ...mark.toJSON(), studentName: student.name });
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