import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureMangaInDb } from "@/lib/mangaSync";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = dbUser?.id;
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get("mangaId");

    // If checking a specific manga
    if (mangaId) {
      if (!userId) {
        return NextResponse.json({ isFavorite: false });
      }

      const isFav = await prisma.favorite.findUnique({
        where: {
          userId_mangaId: {
            userId,
            mangaId,
          },
        },
      });
      return NextResponse.json({ isFavorite: !!isFav });
    }

    // If fetching full favorites list
    if (!userId) {
      return NextResponse.json([]);
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { manga: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Favorites GET error:", error);
    const { searchParams } = new URL(req.url);
    if (searchParams.get("mangaId")) {
      return NextResponse.json({ isFavorite: false });
    }
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    
    // Resilient fallback: find user ID by email if token.id is not populated
    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = dbUser?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول أولاً لإضافة المانجا إلى مفضلتك" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const mangaId = body.mangaId || body.id;
    const title = body.title || "مانجا";
    const coverImage = body.coverImage || "";
    const author = body.author || "غير معروف";
    const status = body.status || "مستمر";
    const genres = Array.isArray(body.genres) ? body.genres : [];

    if (!mangaId) {
      return NextResponse.json({ error: "معرف المانجا مفقود" }, { status: 400 });
    }

    // 1. Ensure manga exists in DB before creating favorite
    try {
      await prisma.manga.upsert({
        where: { id: mangaId },
        update: {
          title,
          coverImage,
          author,
          status,
          genres,
        },
        create: {
          id: mangaId,
          title,
          coverImage,
          author,
          status,
          genres,
        },
      });
    } catch (mangaErr) {
      console.warn("Manga upsert in favorites warning:", mangaErr);
    }

    // 2. Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        isFavorite: false,
        message: "تمت إزالة العمل من المفضلة",
      });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          mangaId,
        },
      });
      return NextResponse.json({
        isFavorite: true,
        favorite,
        message: "تمت إضافة العمل إلى المفضلة بنجاح ❤️",
      });
    }
  } catch (error: any) {
    console.error("Favorites POST error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء حفظ المفضلة" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get("mangaId");

    if (!mangaId) {
      return NextResponse.json({ error: "Missing mangaId" }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        mangaId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت إزالة العمل من المفضلة بنجاح",
    });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
