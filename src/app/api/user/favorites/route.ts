import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureMangaInDb } from "@/lib/mangaSync";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

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
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول أولاً لإضافة المانجا إلى مفضلتك" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const mangaId = body.mangaId || body.id;
    const title = body.title;
    const coverImage = body.coverImage;
    const author = body.author;
    const status = body.status;
    const genres = body.genres;

    if (!mangaId) {
      return NextResponse.json({ error: "Missing mangaId" }, { status: 400 });
    }

    // Ensure manga exists in database
    await ensureMangaInDb({
      id: mangaId,
      title: title || "مانجا",
      coverImage: coverImage || "",
      author: author || "غير معروف",
      status: status || "مستمر",
      genres: Array.isArray(genres) ? genres : [],
    });

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
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
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
