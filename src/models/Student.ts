import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide student name'],
    trim: true,
  },
  admissionNumber: {
    type: String,
    required: [true, 'Please provide admission number'],
    unique: true,
    trim: true,
  },
  class: {
    type: String,
    required: [true, 'Please provide class'],
    enum: ['6th', '8th', 'Plus One', 'Plus Two', 'D1', 'D2', 'D3'],
    trim: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index on admission number and class
studentSchema.index({ admissionNumber: 1, class: 1 });

// Update the updatedAt timestamp before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema); 