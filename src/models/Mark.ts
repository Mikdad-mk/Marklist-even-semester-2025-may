import mongoose from 'mongoose';

export interface IMark {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subject: string;
  ce: number;
  te: number;
  total: number;
  result: 'Pass' | 'Fail';
  createdAt: Date;
  updatedAt: Date;
}

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  ce: {
    type: Number,
    required: true,
    min: 0,
    max: 30,
  },
  te: {
    type: Number,
    required: true,
    min: 0,
    max: 70,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Create index for better query performance
markSchema.index({ studentId: 1, subject: 1 });
markSchema.index({ teacherId: 1 });

const Mark = mongoose.models.Mark || mongoose.model<IMark>('Mark', markSchema);
export default Mark; 