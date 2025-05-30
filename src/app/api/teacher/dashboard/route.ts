import { NextRequest, NextResponse } from 'next/server';
import { verify } from "jsonwebtoken";
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Mark from '@/models/Mark';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getTeacherFromToken(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      isApproved: boolean;
    };

    if (decoded.role !== 'teacher' || !decoded.isApproved) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const teacher = await getTeacherFromToken(req);
    if (!teacher) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get total marks entered by this teacher
    const totalMarksCount = await Mark.countDocuments({ teacherId: teacher.id });
    
    // Get passing marks count for this teacher
    const passingMarksCount = await Mark.countDocuments({ 
      teacherId: teacher.id,
      result: 'Pass' 
    });
    
    // Calculate success rate for this teacher's marks
    const successRate = totalMarksCount > 0 
      ? Math.round((passingMarksCount / totalMarksCount) * 100) 
      : 0;

    // Get class-wise performance for this teacher's marks
    const classPerformance = await Mark.aggregate([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(teacher.id)
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $group: {
          _id: '$student.class',
          totalMarks: { $sum: 1 },
          totalScore: { $sum: { $add: ['$ce', '$te'] } },
          passingCount: {
            $sum: {
              $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0]
            }
          },
          averageScore: { $avg: { $add: ['$ce', '$te'] } },
          studentCount: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          class: '$_id',
          totalMarks: 1,
          averageScore: { $round: ['$averageScore', 2] },
          passPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$passingCount', '$totalMarks'] },
                  100
                ]
              },
              2
            ]
          },
          studentCount: { $size: '$studentCount' }
        }
      },
      {
        $sort: { class: 1 }
      }
    ]);

    // Get top performers from this teacher's marks
    const topPerformers = await Mark.aggregate([
      {
        $match: {
          teacherId: new mongoose.Types.ObjectId(teacher.id)
        }
      },
      {
        $group: {
          _id: '$studentId',
          averageScore: { $avg: { $add: ['$ce', '$te'] } },
          totalMarks: { $sum: 1 }
        }
      },
      {
        $sort: { 
          averageScore: -1
        }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $unwind: {
          path: '$studentDetails',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          _id: '$studentDetails._id',
          name: '$studentDetails.name',
          admissionNumber: '$studentDetails.admissionNumber',
          class: '$studentDetails.class',
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      {
        $limit: 5
      }
    ]);

    return NextResponse.json({
      totalMarks: totalMarksCount,
      successRate,
      topPerformers,
      classPerformance
    });
  } catch (error) {
    console.error('Teacher dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 