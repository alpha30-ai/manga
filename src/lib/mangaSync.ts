import prisma from "@/lib/prisma";

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
    return await prisma.manga.upsert({
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
    return await prisma.chapter.upsert({
      where: { id: data.id },
      update: {
        title: data.title || "الفصل",
        chapterNum: data.chapterNum ?? 1,
        pages: data.pages || [],
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
  } catch (error) {
    console.error("Error ensuring chapter in DB:", error);
    return null;
  }
}
