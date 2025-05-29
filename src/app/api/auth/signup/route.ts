import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import PreRegisteredTeacher from "@/models/PreRegisteredTeacher";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, registerNumber } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // For teacher signups, validate against pre-registered teachers
    if (registerNumber) {
      const preRegisteredTeacher = await PreRegisteredTeacher.findOne({
        name,
        registerNumber,
        isRegistered: false
      });

      if (!preRegisteredTeacher) {
        return NextResponse.json(
          { error: "Invalid teacher details. Please check your name and register number" },
          { status: 400 }
        );
      }

      // Mark the pre-registered teacher as registered
      await PreRegisteredTeacher.findByIdAndUpdate(preRegisteredTeacher._id, {
        isRegistered: true
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      registerNumber,
      role: registerNumber ? 'teacher' : 'student',
      isApproved: false,
      status: 'active'
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      registerNumber: user.registerNumber
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 