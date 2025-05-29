import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

async function migratePasswordField() {
  try {
    await dbConnect();
    
    // Find all users with password field
    const users = await User.find({ password: { $exists: true } });
    
    console.log(`Found ${users.length} users with old password field`);
    
    for (const user of users) {
      // Move password to passwordHash
      await User.updateOne(
        { _id: user._id },
        {
          $set: { passwordHash: user.password },
          $unset: { password: "" }
        }
      );
      console.log(`Migrated user: ${user.email}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePasswordField(); 