import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get total students count
    const totalStudents = await db.collection('students').countDocuments();

    // Get total marks entries count
    const totalMarks = await db.collection('marks').countDocuments();

    // Get total classes (unique class values from students)
    const uniqueClasses = await db.collection('students').distinct('class');
    const totalClasses = uniqueClasses.length;

    // Get top performing students
    const topPerformers = await db.collection('marks')
      .aggregate([
        {
          $group: {
            _id: '$studentId',
            averageScore: { $avg: { $add: ['$ce', '$te'] } },
            totalMarks: { $sum: 1 }
          }
        },
        {
          $match: {
            totalMarks: { $gte: 3 } // Only consider students with at least 3 subjects
          }
        },
        {
          $sort: { averageScore: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $unwind: '$student'
        },
        {
          $project: {
            _id: 1,
            name: '$student.name',
            admissionNumber: '$student.admissionNumber',
            class: '$student.class',
            averageScore: { $round: ['$averageScore', 2] }
          }
        }
      ]).toArray();

    return NextResponse.json({
      totalStudents,
      totalClasses,
      totalMarks,
      topPerformers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 