import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureChapterInDb, ensureMangaInDb } from "@/lib/mangaSync";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  const mangaId = searchParams.get("mangaId");
  const postId = searchParams.get("postId");

  try {
    let whereClause: any = {};
    if (chapterId) whereClause.chapterId = chapterId;
    else if (postId) whereClause.postId = postId;
    else if (mangaId) {
      whereClause.chapter = { mangaId };
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "يجب تسجيل الدخول للتعليق" }, { status: 401 });
    }

    const { content, chapterId, mangaId, postId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: "نص التعليق مطلوب" }, { status: 400 });
    }

    // If chapterId and mangaId provided, ensure chapter exists in DB
    if (chapterId && mangaId) {
      await ensureMangaInDb({ id: mangaId, title: "مانجا" });
      await ensureChapterInDb({ id: chapterId, mangaId, title: "فصل" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        chapterId: chapterId || null,
        postId: postId || null,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "تم إضافة التعليق بنجاح", comment }, { status: 201 });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إضافة التعليق" }, { status: 500 });
  }
}
