import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, role: true },
      }),
      prisma.userSettings.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      ...(settings || { theme: "system", readerMode: "scroll", fitMode: "width" }),
      name: user?.name,
      email: user?.email,
      image: user?.image,
      role: user?.role,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { theme, readerMode, fitMode } = await req.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(theme && { theme }),
        ...(readerMode && { readerMode }),
        ...(fitMode && { fitMode }),
      },
      create: {
        userId: session.user.id,
        theme: theme || "system",
        readerMode: readerMode || "scroll",
        fitMode: fitMode || "width",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
