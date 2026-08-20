import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { multiSourceManager } from "@/lib/scrapers/multiSourceManager";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

// 1. GET: Export Full Database Backup JSON
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
  }

  try {
    const [mangas, chapters, sources, settings, comments, communityPosts, requests, users] = await Promise.all([
      prisma.manga.findMany(),
      prisma.chapter.findMany({ take: 5000 }),
      prisma.mangaSource.findMany(),
      prisma.siteSettings.findFirst(),
      prisma.comment.findMany({ take: 2000 }),
      prisma.communityPost.findMany({ take: 1000 }),
      prisma.mangaRequest.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
    ]);

    const backupData = {
      version: "14.0",
      timestamp: new Date().toISOString(),
      counts: {
        mangas: mangas.length,
        chapters: chapters.length,
        sources: sources.length,
        comments: comments.length,
        communityPosts: communityPosts.length,
        users: users.length,
        requests: requests.length,
      },
      data: {
        mangas,
        chapters,
        sources,
        settings,
        comments,
        communityPosts,
        requests,
        users,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="alpha-manga-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Database backup error:", error);
    return NextResponse.json({ error: "فشل تصدير النسخة الاحتياطية" }, { status: 500 });
  }
}

// 2. POST: Restore Backup or Reset Data
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, backupData } = body;

    // A. Clear Chapter Cache only (preserves manga cards)
    if (action === "clear-chapters") {
      const deleted = await prisma.chapter.deleteMany();
      return NextResponse.json({
        success: true,
        message: `تم تفريغ كافة الفصول بنجاح (${deleted.count} فصل). سيتم إعادة سحب الفصول تلقائياً عند قراءة أي عمل.`,
      });
    }

    // B. Clear Reader Cache (clears stored pages and reading history)
    if (action === "clear-cache") {
      await prisma.chapter.updateMany({ data: { pages: [] } });
      const deletedHistory = await prisma.readingHistory.deleteMany();
      return NextResponse.json({
        success: true,
        message: `تم إفراغ كاش الصفحات وسجل القراءة بنجاح (${deletedHistory.count} سجل).`,
      });
    }

    // C. Reset Sources to Defaults
    if (action === "reset-sources") {
      await prisma.mangaSource.deleteMany();
      const syncResult = await multiSourceManager.syncSourcesFromRepository();
      return NextResponse.json({
        success: true,
        message: `تمت إعادة ضبط وتحديث المصادر للمصادر الافتراضية بنجاح (${syncResult.count} مصدر نشط).`,
      });
    }

    // D. Reset Manga & Chapters (Clear All Scraped Manga)
    if (action === "reset-manga") {
      const delChapters = await prisma.chapter.deleteMany();
      await prisma.readingHistory.deleteMany();
      await prisma.favorite.deleteMany();
      const delManga = await prisma.manga.deleteMany();

      return NextResponse.json({
        success: true,
        message: `تم تصفير وحذف كافة أعمال المانجا (${delManga.count} عمل) والفصول (${delChapters.count} فصل) بنجاح.`,
      });
    }

    // E. Reset Community & Comments
    if (action === "reset-community") {
      const delComm = await prisma.comment.deleteMany();
      await prisma.postLike.deleteMany();
      const delPosts = await prisma.communityPost.deleteMany();

      return NextResponse.json({
        success: true,
        message: `تم تصفير وحذف منشورات المجتمع (${delPosts.count} منشور) والتعليقات (${delComm.count} تعليق) بنجاح.`,
      });
    }

    // F. Factory Reset (Clean everything except Admin accounts)
    if (action === "factory-reset") {
      await prisma.chapter.deleteMany();
      await prisma.readingHistory.deleteMany();
      await prisma.favorite.deleteMany();
      await prisma.manga.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.postLike.deleteMany();
      await prisma.communityPost.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.mangaRequest.deleteMany();
      await multiSourceManager.syncSourcesFromRepository();

      return NextResponse.json({
        success: true,
        message: "تمت استعادة ضبط المصنع بالكامل بنجاح مع الحفاظ على حساب المدير وتثبيت المصادر المعتمدة.",
      });
    }

    // G. Restore from JSON Backup
    if (action === "restore") {
      if (!backupData || !backupData.data) {
        return NextResponse.json({ error: "ملف النسخة الاحتياطية غير صالح" }, { status: 400 });
      }

      const { mangas = [], chapters = [], sources = [], settings } = backupData.data;

      // Restore Mangas
      for (const m of mangas) {
        await prisma.manga.upsert({
          where: { id: m.id },
          update: m,
          create: m,
        });
      }

      // Restore Chapters
      for (const c of chapters) {
        await prisma.chapter.upsert({
          where: { id: c.id },
          update: c,
          create: c,
        });
      }

      // Restore Sources
      for (const s of sources) {
        await prisma.mangaSource.upsert({
          where: { id: s.id },
          update: s,
          create: s,
        });
      }

      // Restore Settings
      if (settings) {
        await prisma.siteSettings.upsert({
          where: { id: "default" },
          update: settings,
          create: settings,
        });
      }

      return NextResponse.json({
        success: true,
        message: `تمت استعادة النسخة الاحتياطية بنجاح (${mangas.length} عمل، ${chapters.length} فصل، ${sources.length} مصدر).`,
      });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Database action error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ في قاعدة البيانات" }, { status: 500 });
  }
}
