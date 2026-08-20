import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetOTP } from "@/lib/mail";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "لا يوجد حساب مسجل بهذا البريد الإلكتروني" }, { status: 404 });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    try {
      await sendPasswordResetOTP(email, otp, user.name || "عزيزي القارئ");
    } catch (e) {
      console.error("Failed to send password reset OTP:", e);
    }

    return NextResponse.json({ message: "تم إرسال كود استعادة كلمة المرور إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء معالجة طلب استعادة كلمة المرور" }, { status: 500 });
  }
}
