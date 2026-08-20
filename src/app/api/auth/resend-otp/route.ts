import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTP } from "@/lib/mail";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "هذا الحساب غير موجود" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "الحساب مفعل بالفعل" }, { status: 400 });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error("Failed to resend OTP email:", emailError);
      return NextResponse.json({ message: "فشل إرسال كود التحقق. حاول مرة أخرى لاحقاً." }, { status: 500 });
    }

    return NextResponse.json({ message: "تم إعادة إرسال كود التحقق بنجاح" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إعادة إرسال الكود" }, { status: 500 });
  }
}
