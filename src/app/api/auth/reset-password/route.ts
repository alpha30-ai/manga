import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) return NextResponse.json({ message: "جميع الحقول مطلوبة" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
    if (user.otp !== otp) return NextResponse.json({ message: "الكود غير صحيح" }, { status: 400 });
    if (!user.otpExpiry || user.otpExpiry < new Date()) return NextResponse.json({ message: "الكود منتهي الصلاحية" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
    });

    return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "حدث خطأ" }, { status: 500 });
  }
}
