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
    });

    // If user has 0 notifications, create a welcome notification
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

    const { notificationId, markAllAsRead } = await req.json();

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "تم تحديد جميع الإشعارات كمقروءة" });
    }

    if (notificationId) {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
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

    const { notificationId, clearAll } = await req.json();

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ success: true, message: "تم مسح جميع الإشعارات" });
    }

    if (notificationId) {
      await prisma.notification.delete({
        where: { id: notificationId },
      });
      return NextResponse.json({ success: true, message: "تم حذف الإشعار" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
