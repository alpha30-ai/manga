import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendOTP } from "@/lib/mail";

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "الرجاء إدخال جميع الحقول" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if it's the first user to assign ADMIN role
    const usersCount = await prisma.user.count();
    const role = usersCount === 0 ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        role,
      },
    });

    // Send OTP via email
    try {
      await sendOTP(email, otp);
    } catch (error) {
      console.error("Error sending OTP:", error);
      // We still create the user, but they might need to request a new OTP
    }

    return NextResponse.json({ message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني", userId: user.id }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إنشاء الحساب" }, { status: 500 });
  }
}
