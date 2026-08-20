import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendDeleteAccountOTP } from "@/lib/mail";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "غير مصرح" }, { status: 401 });

    const { action, otp } = await req.json();
    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ message: "المستخدم غير موجود" }, { status: 404 });

    if (action === "request") {
      const code = generateOTP();
      await prisma.user.update({
        where: { id: userId },
        data: { otp: code, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes for security
      });
      try {
        await sendDeleteAccountOTP(user.email, code, user.name || "عزيزي القارئ");
      } catch (e) {
        console.error("Delete account email error:", e);
      }
      return NextResponse.json({ message: "تم إرسال كود تأكيد حذف الحساب إلى بريدك الإلكتروني" });
    }

    if (action === "confirm") {
      if (user.otp !== otp) return NextResponse.json({ message: "كود التحقق غير صحيح" }, { status: 400 });
      if (!user.otpExpiry || user.otpExpiry < new Date()) return NextResponse.json({ message: "كود التحقق منتهي الصلاحية" }, { status: 400 });
      if (user.role === "ADMIN") return NextResponse.json({ message: "لا يمكن حذف حساب المدير العام" }, { status: 403 });

      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ message: "تم حذف الحساب وكافة البيانات المرتبطة به نهائياً" });
    }

    return NextResponse.json({ message: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء معالجة طلب حذف الحساب" }, { status: 500 });
  }
}
