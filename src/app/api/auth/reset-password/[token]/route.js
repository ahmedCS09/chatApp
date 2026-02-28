import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "@/models/userModel.js";
import { dbConnect } from "@/lib/mongodb.js";

export async function POST(req, context) {
  await dbConnect();

  // ✅ FIX: unwrap params correctly
  const { token } = await context.params;

  const { password } = await req.json();

  if (!token) {
    return NextResponse.json(
      { message: "Reset token missing" },
      { status: 400 }
    );
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 400 }
    );
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return NextResponse.json({ message: "Password updated successfully" });
}