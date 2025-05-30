import mongoose from 'mongoose';

export interface IStudent {
  name: string;
  admissionNumber: string;
  class: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create a compound index on admission number and class
studentSchema.index({ admissionNumber: 1, class: 1 });

// Update the updatedAt timestamp before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

export default Student; 