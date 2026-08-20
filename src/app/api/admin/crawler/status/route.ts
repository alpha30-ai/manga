import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const [totalManga, totalChapters, totalSources, mangas] = await Promise.all([
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.mangaSource.count(),
      prisma.manga.findMany({
        take: 50,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalManga,
      totalChapters,
      totalSources,
      mangas: mangas.map((m) => ({
        id: m.id,
        title: m.title,
        coverImage: m.coverImage,
        author: m.author,
        status: m.status,
        genres: m.genres,
        chaptersCount: m._count.chapters,
        source: m.source || "MangaDex",
        updatedAt: m.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Crawler status API error:", error);
    return NextResponse.json({ message: "فشل جلب بيانات الكرولر" }, { status: 500 });
  }
}
