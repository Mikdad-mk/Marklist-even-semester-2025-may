const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/result";

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);

  // Find users with teacherRegNumber and update them
  const users = await User.find({ teacherRegNumber: { $exists: true } });
  for (const user of users) {
    if (user.teacherRegNumber && !user.registerNumber) {
      user.registerNumber = user.teacherRegNumber;
      user.teacherRegNumber = undefined;
      await user.save();
      console.log(`Migrated user ${user.email}`);
    }
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
}

migrate(); 