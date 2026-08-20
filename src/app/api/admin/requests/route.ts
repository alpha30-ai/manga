import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const requests = await prisma.mangaRequest.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Admin Requests GET error:", error);
    return NextResponse.json({ message: "فشل جلب الطلبات" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const { requestId, status, adminNote } = await req.json();

    if (!requestId) {
      return NextResponse.json({ message: "معرف الطلب مطلوب" }, { status: 400 });
    }

    const updated = await prisma.mangaRequest.update({
      where: { id: requestId },
      data: {
        status: status || undefined,
        adminNote: adminNote !== undefined ? adminNote : undefined,
      },
    });

    // If there is a user attached, send them a notification about the status change
    if (updated.userId) {
      const statusText =
        status === "COMPLETED"
          ? "تم تنفيذ وتوفير طلبك بنجاح! 🎉"
          : status === "APPROVED"
          ? "تمت الموافقة على طلبك وجاري العمل عليه ⚡"
          : status === "REJECTED"
          ? "تحديث بخصوص طلبك ℹ️"
          : "تم تحديث حالة طلبك";

      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: statusText,
          message: adminNote
            ? `بخصوص "${updated.title}": ${adminNote}`
            : `تم تغيير حالة طلبك "${updated.title}" إلى ${status}`,
          link: "/requests",
        },
      });
    }

    return NextResponse.json({
      message: "تم تحديث حالة الطلب بنجاح وإشعار المستخدم!",
      request: updated,
    });
  } catch (error) {
    console.error("Admin Requests PATCH error:", error);
    return NextResponse.json({ message: "فشل تحديث الطلب" }, { status: 500 });
  }
}
