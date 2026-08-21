import prisma from "@/lib/prisma";
import memoryCache from "@/lib/cache";

export async function ensureMangaInDb(data: {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  source?: string;
  author?: string;
  status?: string;
  genres?: string[];
}) {
  try {
    const manga = await prisma.manga.upsert({
      where: { id: data.id },
      update: {
        title: data.title || "بدون عنوان",
        description: data.description || "",
        coverImage: data.coverImage || "",
        author: data.author || "غير معروف",
        status: data.status || "مستمر",
        genres: data.genres || [],
        source: data.source || "MangaDex",
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        title: data.title || "بدون عنوان",
        description: data.description || "",
        coverImage: data.coverImage || "",
        author: data.author || "غير معروف",
        status: data.status || "مستمر",
        genres: data.genres || [],
        source: data.source || "MangaDex",
      },
    });

    // Populate memory cache
    memoryCache.set(`manga:${data.id}`, manga, 1800);
    return manga;
  } catch (error) {
    console.error("Error ensuring manga in DB:", error);
    return null;
  }
}

export async function ensureChapterInDb(data: {
  id: string;
  mangaId: string;
  title?: string;
  chapterNum?: number;
  pages?: string[];
}) {
  try {
    const chapter = await prisma.chapter.upsert({
      where: { id: data.id },
      update: {
        title: data.title || "الفصل",
        chapterNum: data.chapterNum ?? 1,
        ...(data.pages && data.pages.length > 0 ? { pages: data.pages } : {}),
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        mangaId: data.mangaId,
        title: data.title || "الفصل",
        chapterNum: data.chapterNum ?? 1,
        pages: data.pages || [],
      },
    });

    // Populate memory cache
    memoryCache.set(`chapter:${data.id}`, chapter, 1800);
    if (data.pages && data.pages.length > 0) {
      memoryCache.set(`chapter_pages:${data.id}`, data.pages, 86400);
    }
    return chapter;
  } catch (error) {
    console.error("Error ensuring chapter in DB:", error);
    return null;
  }
}
