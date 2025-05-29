import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

const Mark = mongoose.models.Mark || mongoose.model('Mark', markSchema);

export default Mark; 