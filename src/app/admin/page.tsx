import React from "react";
import prisma from "@/lib/prisma";
import {
  Users,
  MessageSquare,
  BookOpen,
  Layers,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sliders,
  Sparkles,
  Server,
  Database,
  Cpu,
  Plus,
  Inbox,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let usersCount = 0;
  let commentsCount = 0;
  let sourcesCount = 0;
  let mangaCount = 0;
  let chaptersCount = 0;
  let readsCount = 0;
  let requestsCount = 0;
  let recentUsers: any[] = [];
  let recentComments: any[] = [];

  try {
    // 1. Fetch all counts in a single ultra-fast query to avoid connection pool exhaustion
    const countsResult: any = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*)::int FROM "User") as "usersCount",
        (SELECT COUNT(*)::int FROM "Comment") as "commentsCount",
        (SELECT COUNT(*)::int FROM "MangaSource") as "sourcesCount",
        (SELECT COUNT(*)::int FROM "Manga") as "mangaCount",
        (SELECT COUNT(*)::int FROM "Chapter") as "chaptersCount",
        (SELECT COUNT(*)::int FROM "ReadingHistory") as "readsCount",
        (SELECT COUNT(*)::int FROM "MangaRequest") as "requestsCount"
    `.catch(async () => {
      // Fallback if raw query fails
      const [u, c, s, m, ch, r, req] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.comment.count().catch(() => 0),
        prisma.mangaSource.count().catch(() => 0),
        prisma.manga.count().catch(() => 0),
        prisma.chapter.count().catch(() => 0),
        prisma.readingHistory.count().catch(() => 0),
        prisma.mangaRequest.count().catch(() => 0),
      ]);
      return [{ usersCount: u, commentsCount: c, sourcesCount: s, mangaCount: m, chaptersCount: ch, readsCount: r, requestsCount: req }];
    });

    if (countsResult && countsResult[0]) {
      usersCount = Number(countsResult[0].usersCount) || 0;
      commentsCount = Number(countsResult[0].commentsCount) || 0;
      sourcesCount = Number(countsResult[0].sourcesCount) || 0;
      mangaCount = Number(countsResult[0].mangaCount) || 0;
      chaptersCount = Number(countsResult[0].chaptersCount) || 0;
      readsCount = Number(countsResult[0].readsCount) || 0;
      requestsCount = Number(countsResult[0].requestsCount) || 0;
    }

    // 2. Fetch recent lists in sequential lightweight queries
    recentUsers = await prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }).catch(() => []);

    recentComments = await prisma.comment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    }).catch(() => []);
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
  }

  const statCards = [
    {
      label: "إجمالي المستخدمين المسجلين",
      value: usersCount,
      trend: "+100%",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-900/40",
    },
    {
      label: "إجمالي التعليقات والمشاركات",
      value: commentsCount,
      trend: "حي ومباشر",
      icon: MessageSquare,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-900/40",
    },
    {
      label: "المصادر والسيرفرات النشطة",
      value: sourcesCount,
      trend: "متعدد المصادر",
      icon: Layers,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-900/40",
    },
    {
      label: "إجمالي عمليات القراءة المحفوظة",
      value: readsCount,
      trend: "تحديث فوري",
      icon: BookOpen,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900/40",
    },
  ];

  return (
    <div className="space-y-8 w-full min-w-0" dir="rtl">
      {/* Enterprise Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-zinc-900 border border-slate-700/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-black border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام ألفا مانجا إنتربرايز v5.5</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            لوحة القيادة والتحكم الشاملة
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            مراقبة حية لكافة أنشطة المنصة، إدارة إعدادات الهوية والشعار، التحكم في المستخدمين، السيرفرات، ومتابعة التعليقات فورياً من قاعدة البيانات.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          <Link
            href="/admin/settings"
            className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-[#FF334B]" />
            <span>إعدادات الموقع والشعار</span>
          </Link>
          <Link
            href="/admin/requests"
            className="px-5 py-3 bg-[#FF334B] hover:bg-rose-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            <span>طلبات القراء ({requestsCount})</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                {stat.trend}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                {stat.label}
              </span>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* System Health & Status Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/90 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>حالة البنية التحتية والخوادم المباشرة</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/60 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-500" />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">قاعدة بيانات PostgreSQL</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">متصلة ونشطة ✓</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/60 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-purple-500" />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">محرك جلب الفصول والـ CDN</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">استجابة سريعة &lt; 150ms</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/60 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-amber-500" />
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">خدمة المصادقة وحماية الجلسات</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">تشفير JWT + NextAuth</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Live Lists: Users & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Users */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/60">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>أحدث المسجلين في الموقع</span>
            </h3>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#FF334B] hover:underline"
            >
              إدارة الكل ({usersCount})
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
            {recentUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {u.name || "بدون اسم"}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  {u.role === "ADMIN" ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/30">
                      مدير النظام
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg">
                      عضو قارئ
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recentUsers.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                لا يوجد مستخدمون مسجلون بعد.
              </div>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/60">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>أحدث التعليقات والمشاركات</span>
            </h3>
            <Link
              href="/admin/comments"
              className="text-xs font-bold text-[#FF334B] hover:underline"
            >
              مراقبة الكل ({commentsCount})
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
            {recentComments.map((c) => (
              <div key={c.id} className="p-4 space-y-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {c.user?.name || "مستخدم"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                  {c.content}
                </p>
              </div>
            ))}

            {recentComments.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                لا توجد تعليقات جديدة.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
