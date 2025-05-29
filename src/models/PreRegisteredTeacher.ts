import mongoose from 'mongoose';

const preRegisteredTeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const PreRegisteredTeacher = mongoose.models.PreRegisteredTeacher || mongoose.model('PreRegisteredTeacher', preRegisteredTeacherSchema);

export default PreRegisteredTeacher; 