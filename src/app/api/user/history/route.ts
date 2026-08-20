import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureMangaInDb, ensureChapterInDb } from "@/lib/mangaSync";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.readingHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        manga: true,
        chapter: true,
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      mangaId,
      chapterId,
      pageNumber,
      mangaTitle,
      mangaCover,
      chapterTitle,
      chapterNum,
    } = await req.json();

    if (!mangaId || !chapterId || pageNumber === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure manga & chapter are in database
    await ensureMangaInDb({
      id: mangaId,
      title: mangaTitle || "مانجا",
      coverImage: mangaCover || "",
    });

    await ensureChapterInDb({
      id: chapterId,
      mangaId,
      title: chapterTitle || "فصل",
      chapterNum: typeof chapterNum === "number" ? chapterNum : 1,
    });

    const history = await prisma.readingHistory.upsert({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId,
        },
      },
      update: {
        chapterId,
        pageNumber,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        mangaId,
        chapterId,
        pageNumber,
      },
      include: {
        manga: true,
        chapter: true,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { historyId, clearAll } = await req.json();

    if (clearAll) {
      await prisma.readingHistory.deleteMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json({ success: true, message: "تم مسح سجل القراءة بالكامل" });
    }

    if (historyId) {
      await prisma.readingHistory.delete({
        where: { id: historyId },
      });
      return NextResponse.json({ success: true, message: "تم حذف العنصر من السجل" });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("History DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
