import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const userId = session.user.id;

  const [user, history, favorites, notifications, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    }),
    prisma.readingHistory.findMany({
      where: { userId },
      include: {
        manga: true,
        chapter: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.favorite.findMany({
      where: { userId },
      include: {
        manga: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.userSettings.findUnique({
      where: { userId },
    }),
  ]);

  const defaultSettings = settings || {
    id: "default",
    userId,
    theme: "system",
    readerMode: "paged",
    fitMode: "width",
    updatedAt: new Date(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16" dir="rtl">
      <ProfileDashboard
        user={user}
        history={history}
        favorites={favorites}
        notifications={notifications}
        settings={defaultSettings}
      />
    </div>
  );
}
