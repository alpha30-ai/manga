import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MangaDexScraper } from "@/lib/scrapers/mangadex";
import { sendNotificationEmail } from "@/lib/mail";

export async function GET() {
  try {
    const scraper = new MangaDexScraper();

    // 1. Fetch all favorites grouped by manga
    const favorites = await prisma.favorite.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        manga: true,
      },
    });

    if (favorites.length === 0) {
      return NextResponse.json({
        message: "لا توجد أعمال محفوظة في المفضلة حالياً للفحص.",
        checkedCount: 0,
      });
    }

    // Group users by mangaId
    const mangaUsersMap = new Map<
      string,
      { mangaTitle: string; users: { id: string; email: string; name: string | null }[] }
    >();

    for (const f of favorites) {
      if (!mangaUsersMap.has(f.mangaId)) {
        mangaUsersMap.set(f.mangaId, {
          mangaTitle: f.manga?.title || "مانجا",
          users: [],
        });
      }
      mangaUsersMap.get(f.mangaId)?.users.push(f.user);
    }

    let updatedMangasCount = 0;
    let notificationsCreated = 0;

    // 2. Check updates for each favorite manga
    for (const [mangaId, { mangaTitle, users }] of mangaUsersMap.entries()) {
      try {
        const chapters = await scraper.getChapters(mangaId);
        if (!chapters || chapters.length === 0) continue;

        const latestScrapedChapter = chapters[0]; // Sorted descending

        // Check if this latest chapter exists in DB
        const existingChapter = await prisma.chapter.findUnique({
          where: { id: latestScrapedChapter.id },
        });

        if (!existingChapter) {
          // New chapter detected! Save chapter to DB
          await prisma.chapter.create({
            data: {
              id: latestScrapedChapter.id,
              mangaId,
              title: latestScrapedChapter.title,
              chapterNum: latestScrapedChapter.chapterNum,
            },
          });

          updatedMangasCount++;

          // Send notifications to all users who favorited this manga
          for (const user of users) {
            // In-app notification
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: `🔥 فصل جديد لـ "${mangaTitle}"!`,
                message: `تم صدور ${latestScrapedChapter.title} الآن بجودة عالية. انقر هنا لبدء القراءة!`,
                link: `/manga/${mangaId}/chapter/${latestScrapedChapter.id}`,
              },
            });

            notificationsCreated++;

            // Email alert if configured
            if (user.email) {
              sendNotificationEmail({
                email: user.email,
                userName: user.name || "عزيزي القارئ",
                title: `صدر فصل جديد: ${latestScrapedChapter.title}`,
                message: `يسعدنا إعلامك بصدور فصل جديد لعملك المفضل "${mangaTitle}". استمتع بالقراءة الحصرية الآن على المنصة.`,
                actionUrl: `/manga/${mangaId}/chapter/${latestScrapedChapter.id}`,
                actionText: "قراءة الفصل الجديد الآن",
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error(`Error checking updates for manga ${mangaId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم فحص تحديثات المفضلة بنجاح. تم تحديث ${updatedMangasCount} أعمال وإرسال ${notificationsCreated} إشعارات.`,
      updatedMangasCount,
      notificationsCreated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check updates cron error:", error);
    return NextResponse.json({ message: "فشل فحص التحديثات" }, { status: 500 });
  }
}
