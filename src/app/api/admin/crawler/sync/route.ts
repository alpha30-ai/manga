import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { crawlerService } from "@/lib/crawler";
import prisma from "@/lib/prisma";
import memoryCache from "@/lib/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const { action, mangaId, query, url, limit = 5, data, chapterId } = body;

    // 1. Search across all Arabic & MangaDex Sources
    if (action === "search-sources") {
      if (!query) {
        return NextResponse.json({ message: "يرجى كتابة اسم العمل للبحث" }, { status: 400 });
      }
      const results = await crawlerService.searchAllSources(query.trim());
      return NextResponse.json({
        success: true,
        results,
      });
    }

    // 2. Direct URL Scraping & Import
    if (action === "sync-url" || url || (query && (query.startsWith("http://") || query.startsWith("https://")))) {
      const targetUrl = url || query || mangaId;
      if (!targetUrl) {
        return NextResponse.json({ message: "يرجى توفير رابط المانجا أو المصدر" }, { status: 400 });
      }

      const result = await crawlerService.crawlAndSaveManga(targetUrl.trim(), true);
      memoryCache.clear();

      return NextResponse.json({
        success: result.status === "success",
        message:
          result.status === "success"
            ? `تم بنجاح زحف الرابط وحفظ عمل "${result.title}" بعدد ${result.chaptersCount} فصل في قاعدة البيانات.`
            : `فشل قراءة الرابط: ${result.error}`,
        result,
      });
    }

    // 3. Single Manga Sync by ID
    if (action === "sync-single") {
      if (!mangaId) {
        return NextResponse.json({ message: "يرجى توفير معرف المانجا mangaId" }, { status: 400 });
      }
      const result = await crawlerService.crawlAndSaveManga(mangaId, true);
      memoryCache.clear();

      return NextResponse.json({
        success: result.status === "success",
        message:
          result.status === "success"
            ? `تم جلب وحفظ "${result.title}" بنجاح (${result.chaptersCount} فصل).`
            : `فشل الجلب: ${result.error}`,
        result,
      });
    }

    // 4. Search and Auto-Sync First Match
    if (action === "search-and-sync") {
      if (!query) {
        return NextResponse.json({ message: "يرجى كتابة اسم العمل للبحث" }, { status: 400 });
      }

      // If user passed a URL, sync URL directly
      if (query.trim().startsWith("http://") || query.trim().startsWith("https://")) {
        const result = await crawlerService.crawlAndSaveManga(query.trim(), true);
        memoryCache.clear();
        return NextResponse.json({
          success: result.status === "success",
          message: `تم زحف الرابط وحفظ "${result.title}" بنجاح في قاعدة البيانات (${result.chaptersCount} فصل).`,
          result,
        });
      }

      const searchResults = await crawlerService.searchAllSources(query.trim());
      if (searchResults.length === 0) {
        return NextResponse.json({ message: "لم يتم العثور على أي نتائج مطابقة في المصادر العربية أو العالمية" }, { status: 404 });
      }

      const target = searchResults[0];
      const targetIdOrUrl = target.url || target.id;
      const result = await crawlerService.crawlAndSaveManga(targetIdOrUrl, true, target.source);
      memoryCache.clear();

      return NextResponse.json({
        success: result.status === "success",
        message: `تم العثور على "${result.title}" من مصدر (${target.source}) وحفظ ${result.chaptersCount} فصل بنجاح!`,
        result,
      });
    }

    // 5. Popular Arabic Feed Bulk Sync
    if (action === "sync-popular-arabic") {
      const results = await crawlerService.crawlPopularArabicFeed(limit);
      const successCount = results.filter((r) => r.status === "success").length;
      memoryCache.clear();
      return NextResponse.json({
        success: true,
        message: `تم سحب وتخزين ${successCount} أعمال مانجا معربة بالكامل في قاعدة البيانات.`,
        results,
      });
    }

    // 6. Sync All Tracked Mangas
    if (action === "sync-all-tracked") {
      const results = await crawlerService.syncAllTrackedMangas();
      memoryCache.clear();
      return NextResponse.json({
        success: true,
        message: `تم تحديث فصول كافة الأعمال المحفوظة في قاعدة البيانات (${results.length} عمل).`,
        results,
      });
    }

    // 7. Delete Manga Permanently
    if (action === "delete-manga") {
      if (!mangaId) {
        return NextResponse.json({ message: "معرف المانجا مفقود" }, { status: 400 });
      }

      await prisma.manga.delete({
        where: { id: mangaId },
      });
      memoryCache.clear();

      return NextResponse.json({
        success: true,
        message: "تم حذف العمل وكافة فصوله من قاعدة البيانات بنجاح",
      });
    }

    // 8. Edit Manga Details
    if (action === "edit-manga") {
      if (!mangaId || !data) {
        return NextResponse.json({ message: "البيانات غير مكتملة" }, { status: 400 });
      }

      const updated = await prisma.manga.update({
        where: { id: mangaId },
        data: {
          title: data.title,
          author: data.author,
          status: data.status,
          description: data.description,
          coverImage: data.coverImage,
          source: data.source,
          genres: Array.isArray(data.genres) ? data.genres : undefined,
        },
      });
      memoryCache.clear();

      return NextResponse.json({
        success: true,
        message: "تم تعديل بيانات المانجا بنجاح",
        manga: updated,
      });
    }

    // 9. Get Manga Chapters for Management
    if (action === "get-manga-chapters") {
      if (!mangaId) {
        return NextResponse.json({ message: "معرف المانجا مفقود" }, { status: 400 });
      }

      const chapters = await prisma.chapter.findMany({
        where: { mangaId },
        orderBy: { chapterNum: "desc" },
        select: {
          id: true,
          title: true,
          chapterNum: true,
          pages: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        chapters,
      });
    }

    // 10. Delete Individual Chapter
    if (action === "delete-chapter") {
      if (!chapterId) {
        return NextResponse.json({ message: "معرف الفصل مفقود" }, { status: 400 });
      }

      await prisma.chapter.delete({
        where: { id: chapterId },
      });
      memoryCache.clear();

      return NextResponse.json({
        success: true,
        message: "تم حذف الفصل بنجاح",
      });
    }

    // 11. Add Manual Chapter
    if (action === "add-chapter") {
      if (!mangaId || !data?.title || data?.chapterNum === undefined) {
        return NextResponse.json({ message: "يرجى تعبئة عنوان ورقم الفصل" }, { status: 400 });
      }

      const newChapterId = `${mangaId}-custom-${Date.now()}`;
      const newChapter = await prisma.chapter.create({
        data: {
          id: newChapterId,
          mangaId,
          title: data.title,
          chapterNum: parseFloat(data.chapterNum),
          pages: Array.isArray(data.pages) ? data.pages : [],
        },
      });
      memoryCache.clear();

      return NextResponse.json({
        success: true,
        message: "تمت إضافة الفصل بنجاح",
        chapter: newChapter,
      });
    }

    return NextResponse.json({ message: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Crawler sync error:", error);
    return NextResponse.json({ message: error.message || "حدث خطأ أثناء تنفيذ الإجراء" }, { status: 500 });
  }
}
