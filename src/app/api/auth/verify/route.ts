import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "البريد الإلكتروني والكود مطلوبان" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "الحساب مفعل بالفعل" }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "الكود غير صحيح" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ message: "الكود منتهي الصلاحية" }, { status: 400 });
    }

    // Mark as verified and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ message: "تم تفعيل الحساب بنجاح" }, { status: 200 });

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء التفعيل" }, { status: 500 });
  }
}
