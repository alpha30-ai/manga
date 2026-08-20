import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { universalUrlScraper } from "@/lib/scrapers/universalUrlScraper";
import { arabicFallbackCrawler } from "@/lib/scrapers/arabicFallbackCrawler";
import MangaReader from "@/components/reader/MangaReader";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureChapterInDb, ensureMangaInDb } from "@/lib/mangaSync";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = await params;
  const session = await getServerSession(authOptions);

  let pages: string[] = [];
  let mangaTitle = "";
  let mangaCover = "";
  let chapters: any[] = [];
  let userSettings: any = null;
  let currentChapterInfo: any = null;

  try {
    // 1. Check if chapter & manga exist in local PostgreSQL database
    const cachedChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        manga: {
          include: {
            chapters: {
              orderBy: { chapterNum: "desc" },
            },
          },
        },
      },
    });

    if (cachedChapter) {
      currentChapterInfo = cachedChapter;
      if (cachedChapter.pages && cachedChapter.pages.length > 0) {
        pages = cachedChapter.pages;
      }
      if (cachedChapter.manga) {
        mangaTitle = cachedChapter.manga.title;
        mangaCover = cachedChapter.manga.coverImage || "";
        chapters = cachedChapter.manga.chapters;
      }
    }

    // 2. Fetch User Settings
    if (session?.user?.id) {
      userSettings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
      });
    }

    // 3. If pages are still empty, fetch from Source URL or MangaDex
    if (pages.length === 0) {
      // A. Try decoding base64url chapter URL
      let chapterUrl = "";
      try {
        const decoded = Buffer.from(chapterId, "base64url").toString("utf-8");
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
          chapterUrl = decoded;
        }
      } catch (e) {}

      if (chapterUrl) {
        pages = await universalUrlScraper.scrapeChapterPages(chapterUrl);

        if (pages.length > 0) {
          // Cache pages in DB
          await prisma.chapter
            .update({
              where: { id: chapterId },
              data: { pages },
            })
            .catch(() => {});
        }
      } else {
        // B. MangaDex Scraper
        const scraper = new MangaDexScraper();
        pages = await scraper.getChapterPages(chapterId);
        if (chapters.length === 0) {
          chapters = await scraper.getChapters(id);
        }
        if (!mangaTitle) {
          const m = await scraper.getMangaDetails(id);
          mangaTitle = m.title;
          mangaCover = m.coverImage;
        }
      }
    }

    // 4. If pages are STILL empty (e.g. MangaDex external chapter or blocked source), use Arabic Fallback Crawler!
    if (pages.length === 0 && mangaTitle) {
      const currentChapterNum = currentChapterInfo?.chapterNum || 1;
      const fallbackPages = await arabicFallbackCrawler.findChapterPagesByNumber(
        mangaTitle,
        currentChapterNum
      );
      if (fallbackPages.length > 0) {
        pages = fallbackPages;
        await prisma.chapter
          .update({
            where: { id: chapterId },
            data: { pages },
          })
          .catch(() => {});
      }
    }

    // 5. If chapters list was not loaded from DB, load it
    if (chapters.length === 0) {
      const dbManga = await prisma.manga.findUnique({
        where: { id },
        include: { chapters: { orderBy: { chapterNum: "desc" } } },
      });
      if (dbManga) {
        mangaTitle = dbManga.title;
        mangaCover = dbManga.coverImage || "";
        chapters = dbManga.chapters;
      }
    }
  } catch (e) {
    console.error("Failed to fetch chapter:", e);
  }

  const currentChapter = chapters.find((c) => c.id === chapterId) || currentChapterInfo;
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);

  // Chapters are ordered desc, so next chapter is at index - 1, prev is at index + 1
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const prevChapter =
    currentIndex >= 0 && currentIndex < chapters.length - 1
      ? chapters[currentIndex + 1]
      : null;

  return (
    <MangaReader
      pages={pages}
      mangaId={id}
      chapterId={chapterId}
      mangaTitle={mangaTitle || "مانجا"}
      chapterTitle={currentChapter?.title || "الفصل"}
      chapterNum={currentChapter?.chapterNum || 1}
      mangaUrl={`/manga/${id}`}
      chapters={chapters}
      nextChapterId={nextChapter?.id || null}
      prevChapterId={prevChapter?.id || null}
      initialSettings={userSettings}
    />
  );
}
