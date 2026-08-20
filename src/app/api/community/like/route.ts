import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "يرجى تسجيل الدخول للإعجاب بالمنشور" }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ message: "معرف المنشور مطلوب" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if like exists
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Remove like
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      // Add like
      await prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });
      isLiked = true;
    }

    const likesCount = await prisma.postLike.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
    });
  } catch (error: any) {
    console.error("Community like error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء تسجيل الإعجاب" }, { status: 500 });
  }
}
