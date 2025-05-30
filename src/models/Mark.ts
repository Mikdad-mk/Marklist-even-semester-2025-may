import mongoose from 'mongoose';

export interface IMark {
  studentId: mongoose.Types.ObjectId;
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
  subject: {
    type: String,
    required: true,
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

// Create a compound index for studentId and subject to ensure uniqueness
markSchema.index({ studentId: 1, subject: 1 }, { unique: true });

const Mark = mongoose.models.Mark || mongoose.model<IMark>('Mark', markSchema);
export default Mark; 