import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Mark from '@/models/Mark';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();

    // Debug: Check if we have any marks
    const marksCount = await Mark.countDocuments();
    // console.log('Total marks count:', marksCount);

    // Debug: Check if we have any students
    const studentsCount = await Student.countDocuments();
    // console.log('Total students count:', studentsCount);

    // Debug: Get a sample mark to check structure
    const sampleMark = await Mark.findOne();
    // console.log('Sample mark:', JSON.stringify(sampleMark, null, 2));

    // Get total students count
    const totalStudents = await Student.countDocuments();

    // Get total classes (unique class values from students)
    const uniqueClasses = await Student.distinct('class');
    const totalClasses = uniqueClasses.length;

    // Calculate success rate
    const totalMarksCount = await Mark.countDocuments();
    const passingMarksCount = await Mark.countDocuments({ result: 'Pass' });
    const successRate = totalMarksCount > 0 
      ? Math.round((passingMarksCount / totalMarksCount) * 100) 
      : 0;

    // Get class-wise performance statistics
    const classPerformance = await Mark.aggregate([
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

    // First, get all students with marks
    const studentsWithMarks = await Mark.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalMarks: { $sum: 1 },
          totalScore: { $sum: { $add: ['$ce', '$te'] } },
          subjects: { $push: { subject: '$subject', ce: '$ce', te: '$te' } }
        }
      }
    ]);
    
    // console.log('Students with marks:', JSON.stringify(studentsWithMarks, null, 2));

    // Then get the top performers with more detailed information
    const topPerformers = await Mark.aggregate([
      // First group by student to calculate their scores
      {
        $group: {
          _id: '$studentId',
          averageScore: { $avg: { $add: ['$ce', '$te'] } },
          totalMarks: { $sum: 1 }
        }
      },
      // Sort by average score first
      {
        $sort: { 
          averageScore: -1
        }
      },
      // Limit to top 10 before doing the lookup
      {
        $limit: 10
      },
      // Now lookup student details
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      // Unwind the student details array
      {
        $unwind: {
          path: '$studentDetails',
          preserveNullAndEmptyArrays: false
        }
      },
      // Project the final format
      {
        $project: {
          _id: '$studentDetails._id',
          name: '$studentDetails.name',
          admissionNumber: '$studentDetails.admissionNumber',
          class: '$studentDetails.class',
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      // Final limit to 5 results
      {
        $limit: 5
      }
    ]);

    console.log('Top Performers Query Result:', JSON.stringify(topPerformers, null, 2));

    return NextResponse.json({
      totalStudents,
      totalClasses,
      successRate,
      topPerformers,
      classPerformance,
      debug: {
        marksCount,
        studentsCount,
        sampleMark,
        studentsWithMarks
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 