import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { multiSourceManager } from "@/lib/scrapers/multiSourceManager";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    let sources = await prisma.mangaSource.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (sources.length === 0) {
      const syncResult = await multiSourceManager.syncSourcesFromRepository();
      sources = syncResult.sources;
    }

    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Cloud Repository Sync Action
    if (body.action === "sync-cloud") {
      const result = await multiSourceManager.syncSourcesFromRepository();
      return NextResponse.json({
        success: true,
        message: `تم بنجاح مزامنة واستيراد ${result.count} مصادر وسيرفرات معربة وعالمية في قاعدة البيانات.`,
        sources: result.sources,
      });
    }

    const { name, baseUrl, language } = body;

    if (!name || !baseUrl || !language) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const source = await prisma.mangaSource.create({
      data: { name, baseUrl, language, isActive: true },
    });

    return NextResponse.json(source);
  } catch (error) {
    return NextResponse.json({ error: "فشل إضافة المصدر" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { sourceId, isActive } = await req.json();

    if (!sourceId || isActive === undefined) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const source = await prisma.mangaSource.update({
      where: { id: sourceId },
      data: { isActive },
    });

    return NextResponse.json(source);
  } catch (error) {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { sourceId } = await req.json();

    if (!sourceId) {
      return NextResponse.json({ error: "معرف المصدر مطلوب" }, { status: 400 });
    }

    await prisma.mangaSource.delete({
      where: { id: sourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
