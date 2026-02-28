import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/userModel.js";
import { dbConnect } from "@/lib/mongodb.js";
import sendEmail from "@/lib/sendEmail.js";

export async function POST(req) {
  await dbConnect();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before saving
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

  await user.save();

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 15 minutes</p>
    `,
  });

  return NextResponse.json({ message: "Reset email sent" });
}