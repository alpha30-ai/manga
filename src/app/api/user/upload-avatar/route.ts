import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ message: "يرجى تحديد صورة صالحة" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    return NextResponse.json({
      message: "تم تحديث الصورة الشخصية بنجاح!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء حفظ الصورة" }, { status: 500 });
  }
}
