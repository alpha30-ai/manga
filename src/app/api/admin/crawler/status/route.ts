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

    // Fast single aggregated count query to prevent connection pool exhaustion
    let counts = { totalManga: 0, totalChapters: 0, totalSources: 0 };
    try {
      const countResult = await prisma.$queryRaw<Array<{
        totalManga: number;
        totalChapters: number;
        totalSources: number;
      }>>`
        SELECT 
          (SELECT COUNT(*)::int FROM "Manga") as "totalManga",
          (SELECT COUNT(*)::int FROM "Chapter") as "totalChapters",
          (SELECT COUNT(*)::int FROM "MangaSource") as "totalSources"
      `;
      if (countResult && countResult[0]) {
        counts = countResult[0];
      }
    } catch (e) {
      console.warn("Raw count query failed, using fallback:", e);
    }

    let mangas: any[] = [];
    try {
      mangas = await prisma.manga.findMany({
        take: 50,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      });
    } catch (e) {
      console.warn("FindMany manga failed:", e);
    }

    return NextResponse.json({
      totalManga: counts.totalManga,
      totalChapters: counts.totalChapters,
      totalSources: counts.totalSources,
      mangas: mangas.map((m) => ({
        id: m.id,
        title: m.title,
        coverImage: m.coverImage,
        author: m.author,
        status: m.status,
        genres: m.genres,
        chaptersCount: m._count?.chapters || 0,
        source: m.source || "MangaDex",
        updatedAt: m.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Crawler status API error:", error);
    return NextResponse.json({
      totalManga: 0,
      totalChapters: 0,
      totalSources: 0,
      mangas: [],
      message: "فشل جلب بيانات الكرولر",
    });
  }
}
