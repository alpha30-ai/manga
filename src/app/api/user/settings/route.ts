import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({
        theme: "system",
        readerMode: "vertical",
        fitMode: "width",
      });
    }

    let user = null;
    let settings = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true, role: true },
      });
    } catch (e) {
      console.warn("User findUnique error:", e);
    }

    try {
      settings = await prisma.userSettings.findUnique({
        where: { userId },
      });
    } catch (e) {
      console.warn("UserSettings findUnique error:", e);
    }

    return NextResponse.json({
      ...(settings || { theme: "system", readerMode: "vertical", fitMode: "width" }),
      name: user?.name || session?.user?.name,
      email: user?.email || session?.user?.email,
      image: user?.image || session?.user?.image,
      role: user?.role || (session?.user as any)?.role || "USER",
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({
      theme: "system",
      readerMode: "vertical",
      fitMode: "width",
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme, readerMode, fitMode } = await req.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(theme && { theme }),
        ...(readerMode && { readerMode }),
        ...(fitMode && { fitMode }),
      },
      create: {
        userId,
        theme: theme || "system",
        readerMode: readerMode || "vertical",
        fitMode: fitMode || "width",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
