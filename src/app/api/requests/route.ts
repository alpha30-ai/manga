import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const requests = await prisma.mangaRequest.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Requests GET error:", error);
    return NextResponse.json({ message: "فشل جلب الطلبات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "يجب تسجيل الدخول لتقديم طلب" }, { status: 401 });
    }

    const { title, type, details } = await req.json();

    if (!title || !type) {
      return NextResponse.json({ message: "الرجاء كتابة عنوان الطلب ونوعه" }, { status: 400 });
    }

    const newRequest = await prisma.mangaRequest.create({
      data: {
        userId: (session.user as any).id,
        title,
        type: type || "MANGA_REQUEST",
        details: details || "",
        status: "PENDING",
      },
    });

    // Create a confirmation notification for user
    await prisma.notification.create({
      data: {
        userId: (session.user as any).id,
        title: "تم استلام طلبك بنجاح ✅",
        message: `تم استلام طلبك "${title}" وجاري مراجعته من قبل فريق الإدارة.`,
        link: "/requests",
      },
    });

    return NextResponse.json({
      message: "تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة في أقرب وقت.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Requests POST error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إرسال الطلب" }, { status: 500 });
  }
}
