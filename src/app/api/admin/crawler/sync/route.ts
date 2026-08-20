import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { crawlerService } from "@/lib/crawler";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const { action, mangaId, query, url, limit = 5 } = body;

    // Direct URL Scraping
    if (action === "sync-url" || url || (query && (query.startsWith("http://") || query.startsWith("https://")))) {
      const targetUrl = url || query || mangaId;
      if (!targetUrl) {
        return NextResponse.json({ message: "يرجى توفير رابط المانجا أو المصدر" }, { status: 400 });
      }

      const result = await crawlerService.crawlAndSaveManga(targetUrl.trim(), true);
      return NextResponse.json({
        success: result.status === "success",
        message:
          result.status === "success"
            ? `تم بنجاح زحف الرابط، تحليل DOM، وحفظ عمل "${result.title}" بعدد ${result.chaptersCount} فصل في قاعدة البيانات.`
            : `فشل قراءة الرابط: ${result.error}`,
        result,
      });
    }

    if (action === "sync-single") {
      if (!mangaId) {
        return NextResponse.json({ message: "يرجى توفير معرف المانجا mangaId" }, { status: 400 });
      }
      const result = await crawlerService.crawlAndSaveManga(mangaId, true);
      return NextResponse.json({
        success: result.status === "success",
        message:
          result.status === "success"
            ? `تم جلب وحفظ "${result.title}" بنجاح (${result.chaptersCount} فصل).`
            : `فشل الجلب: ${result.error}`,
        result,
      });
    }

    if (action === "search-and-sync") {
      if (!query) {
        return NextResponse.json({ message: "يرجى كتابة اسم العمل للبحث" }, { status: 400 });
      }

      // If user passed a URL in the search bar, handle it as URL
      if (query.trim().startsWith("http://") || query.trim().startsWith("https://")) {
        const result = await crawlerService.crawlAndSaveManga(query.trim(), true);
        return NextResponse.json({
          success: result.status === "success",
          message: `تم زحف الرابط وحفظ "${result.title}" بنجاح في قاعدة البيانات (${result.chaptersCount} فصل).`,
          result,
        });
      }

      const searchResults = await crawlerService["scraper"].searchManga(query, { limit: 1 });
      if (searchResults.length === 0) {
        return NextResponse.json({ message: "لم يتم العثور على أي نتائج مطابقة" }, { status: 404 });
      }

      const target = searchResults[0];
      const result = await crawlerService.crawlAndSaveManga(target.id, true);
      return NextResponse.json({
        success: result.status === "success",
        message: `تم جلب وحفظ "${result.title}" بنجاح في قاعدة البيانات (${result.chaptersCount} فصل).`,
        result,
      });
    }

    if (action === "sync-popular-arabic") {
      const results = await crawlerService.crawlPopularArabicFeed(limit);
      const successCount = results.filter((r) => r.status === "success").length;
      return NextResponse.json({
        success: true,
        message: `تم سحب وتخزين ${successCount} أعمال مانجا معربة بالكامل في قاعدة البيانات.`,
        results,
      });
    }

    if (action === "sync-all-tracked") {
      const results = await crawlerService.syncAllTrackedMangas();
      return NextResponse.json({
        success: true,
        message: `تم تحديث فصول كافة الأعمال المحفوظة في قاعدة البيانات (${results.length} عمل).`,
        results,
      });
    }

    return NextResponse.json({ message: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Crawler sync error:", error);
    return NextResponse.json({ message: error.message || "حدث خطأ أثناء السحب" }, { status: 500 });
  }
}
