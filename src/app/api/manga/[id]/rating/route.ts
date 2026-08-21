import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import memoryCache from "@/lib/cache";
import { ensureMangaInDb } from "@/lib/mangaSync";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mangaId } = await params;
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = dbUser?.id;
    }

    // 1. Calculate Real Aggregate Rating from Database
    const stats = await prisma.rating.aggregate({
      where: { mangaId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    let userRating: number | null = null;
    if (userId) {
      const existing = await prisma.rating.findUnique({
        where: {
          userId_mangaId: {
            userId,
            mangaId,
          },
        },
        select: { rating: true },
      });
      if (existing) userRating = existing.rating;
    }

    const totalVotes = stats._count.rating || 0;
    // If real votes exist, compute exact average to 1 decimal place; otherwise return a clean 0 or baseline
    const avgRating = stats._avg.rating
      ? Math.round(stats._avg.rating * 10) / 10
      : 0;

    return NextResponse.json({
      averageRating: avgRating,
      totalVotes,
      userRating,
      hasRated: userRating !== null,
    });
  } catch (error) {
    console.error("Rating GET error:", error);
    return NextResponse.json({
      averageRating: 0,
      totalVotes: 0,
      userRating: null,
      hasRated: false,
    });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mangaId } = await params;
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = dbUser?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول أولاً لتقييم هذا العمل 🔒" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const score = parseInt(body.rating);

    if (isNaN(score) || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "قيمة التقييم يجب أن تكون بين 1 و 5 نجوم" },
        { status: 400 }
      );
    }

    // Ensure manga exists in DB before voting
    if (body.mangaTitle) {
      await ensureMangaInDb({
        id: mangaId,
        title: body.mangaTitle,
        coverImage: body.coverImage || "",
        author: body.author || "غير معروف",
      });
    }

    // Upsert Rating
    await prisma.rating.upsert({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      update: {
        rating: score,
        updatedAt: new Date(),
      },
      create: {
        userId,
        mangaId,
        rating: score,
      },
    });

    // Recompute real average
    const stats = await prisma.rating.aggregate({
      where: { mangaId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalVotes = stats._count.rating || 1;
    const avgRating = stats._avg.rating
      ? Math.round(stats._avg.rating * 10) / 10
      : score;

    memoryCache.delete(`manga_details_full:${mangaId}`);

    return NextResponse.json({
      success: true,
      message: `تم تسجيل تقييمك (${score} نجوم) بنجاح! ⭐`,
      averageRating: avgRating,
      totalVotes,
      userRating: score,
    });
  } catch (error: any) {
    console.error("Rating POST error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء حفظ التقييم" },
      { status: 500 }
    );
  }
}
