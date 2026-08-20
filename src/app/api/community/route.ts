import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "غير مصرح لك بالقيام بهذا الإجراء" }, { status: 401 });
    }

    const { content, title, image } = await req.json();

    if (!content) {
      return NextResponse.json({ message: "المحتوى مطلوب" }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        title: title || "بدون عنوان",
        content,
        image,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ message: "تم النشر بنجاح", post }, { status: 201 });
  } catch (error) {
    console.error("Community post error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء النشر" }, { status: 500 });
  }
}
