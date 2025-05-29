import mongoose from "mongoose";

const teacherRegisterSchema = new mongoose.Schema({
  registerNumber: { type: String, unique: true },
  name: String,
  addedByAdminId: mongoose.Schema.Types.ObjectId,
});

export default mongoose.models.TeacherRegister || mongoose.model("TeacherRegister", teacherRegisterSchema); 