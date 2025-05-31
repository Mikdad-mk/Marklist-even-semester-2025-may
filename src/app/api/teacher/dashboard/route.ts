import { NextRequest, NextResponse } from 'next/server';
import { verify } from "jsonwebtoken";
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Mark from '@/models/Mark';
import mongoose from 'mongoose';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getTeacherFromToken(req: NextRequest) {
  const token = req.cookies.get('auth')?.value;
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    if (decoded.role !== 'teacher') {
      return null;
    }

    // Get the full teacher document to check approval and status
    await dbConnect();
    const teacher = await User.findById(decoded.id);
    
    if (!teacher || !teacher.isApproved || teacher.status !== 'active') {
      return null;
    }

    // Return teacher info including mark entry permission
    return {
      ...decoded,
      canEnterMarks: teacher.canEnterMarks
    };
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

    // Get recent marks entered by this teacher
    const recentMarks = await Mark.aggregate([
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
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          studentName: '$student.name',
          studentClass: '$student.class',
          subject: 1,
          ce: 1,
          te: 1,
          total: 1,
          result: 1,
          createdAt: 1
        }
      }
    ]);

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
          _id: {
            class: '$student.class',
            subject: '$subject'
          },
          totalMarks: { $sum: 1 },
          totalScore: { $sum: '$total' },
          passingCount: {
            $sum: {
              $cond: [{ $eq: ['$result', 'Pass'] }, 1, 0]
            }
          },
          averageScore: { $avg: '$total' },
          studentCount: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          class: '$_id.class',
          subject: '$_id.subject',
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
        $sort: { 
          class: 1,
          subject: 1
        }
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
          _id: {
            studentId: '$studentId',
            subject: '$subject'
          },
          studentName: { $first: '$student.name' },
          studentClass: { $first: '$student.class' },
          admissionNumber: { $first: '$student.admissionNumber' },
          averageScore: { $avg: '$total' },
          totalMarks: { $sum: 1 }
        }
      },
      {
        $sort: { 
          averageScore: -1
        }
      },
      {
        $group: {
          _id: '$_id.subject',
          subject: { $first: '$_id.subject' },
          students: {
            $push: {
              _id: '$_id.studentId',
              name: '$studentName',
              class: '$studentClass',
              admissionNumber: '$admissionNumber',
              averageScore: { $round: ['$averageScore', 2] }
            }
          }
        }
      },
      {
        $project: {
          subject: 1,
          students: { $slice: ['$students', 5] }
        }
      },
      {
        $sort: {
          subject: 1
        }
      }
    ]);

    return NextResponse.json({
      totalMarks: totalMarksCount,
      successRate,
      recentMarks,
      topPerformers,
      classPerformance,
      canEnterMarks: teacher.canEnterMarks
    });
  } catch (error) {
    console.error('Teacher dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 