import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json([]);
    }

    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // If user has 0 notifications, create a friendly welcome notification
    if (notifications.length === 0) {
      try {
        const welcome = await prisma.notification.create({
          data: {
            userId,
            title: "مرحباً بك في ألفا مانجا! 🎉",
            message: "استمتع بقراءة آلاف فصول المانجا والمانهوا بأعلى جودة مع حفظ تقدمك تلقائياً.",
            link: "/browse",
          },
        });
        notifications = [welcome];
      } catch (e) {
        console.warn("Failed to create welcome notification:", e);
      }
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json([]);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const notificationId = body.notificationId || body.id;
    const markAllAsRead = body.markAllAsRead;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({
        success: true,
        message: "تم تحديد جميع الإشعارات كمقروءة",
      });
    }

    if (notificationId) {
      const notification = await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
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

    const body = await req.json().catch(() => ({}));
    const notificationId = body.notificationId || body.id;
    const clearAll = body.clearAll;

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
      return NextResponse.json({
        success: true,
        message: "تم مسح جميع الإشعارات بنجاح",
      });
    }

    if (notificationId) {
      await prisma.notification.deleteMany({
        where: { id: notificationId, userId },
      });
      return NextResponse.json({
        success: true,
        message: "تم حذف الإشعار",
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
