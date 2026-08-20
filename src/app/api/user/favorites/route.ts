import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureMangaInDb } from "@/lib/mangaSync";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get("mangaId");

  try {
    if (mangaId) {
      const isFav = await prisma.favorite.findUnique({
        where: {
          userId_mangaId: {
            userId: session.user.id,
            mangaId,
          },
        },
      });
      return NextResponse.json({ isFavorite: !!isFav });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { manga: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mangaId, title, coverImage, author, status, genres } = await req.json();

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
      genres: genres || [],
    });

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorite: false, message: "تمت الإزالة من المفضلة" });
    } else {
      const favorite = await prisma.favorite.create({
        data: {
          userId: session.user.id,
          mangaId,
        },
      });
      return NextResponse.json({ isFavorite: true, favorite, message: "تمت الإضافة إلى المفضلة" });
    }
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
