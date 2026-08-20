"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  RefreshCw,
  Search,
  Sparkles,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Zap,
  Play,
  Flame,
  ArrowDownToLine,
  ExternalLink,
  Globe,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface StoredManga {
  id: string;
  title: string;
  coverImage: string;
  author: string;
  status: string;
  genres: string[];
  chaptersCount: number;
  source: string;
  updatedAt: string;
}

export default function AdminCrawlerPage() {
  const [stats, setStats] = useState<{
    totalManga: number;
    totalChapters: number;
    totalSources: number;
    mangas: StoredManga[];
  }>({
    totalManga: 0,
    totalChapters: 0,
    totalSources: 0,
    mangas: [],
  });

  const [loading, setLoading] = useState(true);
  const [syncingSingle, setSyncingSingle] = useState(false);
  const [syncingBulk, setSyncingBulk] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reSyncingId, setReSyncingId] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/crawler/status");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      toast.error("فشل جلب إحصائيات الكرولر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isUrlInput = searchQuery.trim().startsWith("http://") || searchQuery.trim().startsWith("https://");

  const handleSearchAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("يرجى إدخال اسم المانجا أو الرابط المباشر للبدء");
      return;
    }

    try {
      setSyncingSingle(true);
      toast.loading(
        isUrlInput
          ? "جاري زحف الرابط، تحليل DOM، واستخراج الفصول وحفظها..."
          : "جاري البحث وسحب الفصول والصفحات من المصدر...",
        { id: "crawl-toast" }
      );

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery.trim());

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isUrlInput ? "sync-url" : isUuid ? "sync-single" : "search-and-sync",
          url: isUrlInput ? searchQuery.trim() : undefined,
          mangaId: isUuid ? searchQuery.trim() : undefined,
          query: !isUuid && !isUrlInput ? searchQuery.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message, { id: "crawl-toast" });
        setSearchQuery("");
        fetchStatus();
      } else {
        toast.error(data.message || "فشل الجلب والحفظ", { id: "crawl-toast" });
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم", { id: "crawl-toast" });
    } finally {
      setSyncingSingle(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      setSyncingBulk(true);
      toast.loading("جاري سحب وحفظ أفضل 6 أعمال معربة بجميع فصولها...", { id: "bulk-toast" });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-popular-arabic", limit: 6 }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: "bulk-toast" });
        fetchStatus();
      } else {
        toast.error(data.message || "فشل السحب الشامل", { id: "bulk-toast" });
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع", { id: "bulk-toast" });
    } finally {
      setSyncingBulk(false);
    }
  };

  const handleSyncAllTracked = async () => {
    if (!confirm("هل تريد مزامنة وتحديث كافة الفصول لجميع الأعمال المحفوظة بقاعدة البيانات؟")) return;

    try {
      setSyncingAll(true);
      toast.loading("جاري فحص وتحديث فصول كافة الأعمال في قاعدة البيانات...", { id: "sync-all-toast" });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-all-tracked" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: "sync-all-toast" });
        fetchStatus();
      } else {
        toast.error(data.message || "فشل التحديث", { id: "sync-all-toast" });
      }
    } catch (e) {
      toast.error("حدث خطأ", { id: "sync-all-toast" });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleReSyncSingle = async (mangaId: string) => {
    try {
      setReSyncingId(mangaId);
      toast.loading("جاري تحديث فصول هذا العمل...", { id: `resync-${mangaId}` });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-single", mangaId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: `resync-${mangaId}` });
        fetchStatus();
      } else {
        toast.error(data.message || "فشل التحديث", { id: `resync-${mangaId}` });
      }
    } catch (e) {
      toast.error("حدث خطأ", { id: `resync-${mangaId}` });
    } finally {
      setReSyncingId(null);
    }
  };

  return (
    <div className="space-y-8 w-full min-w-0" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-zinc-900 border border-slate-700/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-black border border-white/20">
            <Bot className="w-3.5 h-3.5 text-[#FF334B]" />
            <span>نظام الجلب الآلي والزحف عبر الروابط (URL Scraper & Crawler Engine)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            محرك جلب وتخزين الفصول والروابط في قاعدة البيانات
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التعرف الذكي على الروابط وتحليل الـ DOM لسحب المانجات، بياناتها، وصفحات الفصول من أي موقع وحفظها مباشرة في قاعدة بيانات PostgreSQL.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={handleBulkSync}
            disabled={syncingBulk}
            className="px-5 py-3 bg-[#FF334B] hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            {syncingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
            <span>سحب الأعمال المعربة (Auto-Crawl)</span>
          </button>

          <button
            onClick={handleSyncAllTracked}
            disabled={syncingAll}
            className="px-5 py-3 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            {syncingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-indigo-600" />}
            <span>تحديث فصول المخزون</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#FF334B]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">
              المانجات المحفوظة بقاعدة البيانات
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {stats.totalManga.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">
              إجمالي الفصول المربوطة والمخزنة
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {stats.totalChapters.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">
              حالة استقرار التخزين المؤقت
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              PostgreSQL Active ✓
            </h3>
          </div>
        </div>
      </div>

      {/* Instant Search & URL Scraper Tool */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-black text-base sm:text-lg text-slate-950 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#FF334B]" />
            <span>الجلب المباشر بالاسم أو الرابط (URL / Name Scraper)</span>
          </h2>
          {isUrlInput && (
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Link2 className="w-3.5 h-3.5" />
              <span>تم التعرف على رابط مباشر (DOM Parser Active)</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400">
          يمكنك إدخال اسم العمل (مثل Solo Leveling)، معرف المانجا، أو <strong>لصق رابط كامل لأي موقع مانجا</strong> (MangaDex أو مواقع Madara والترجمات العربية). سيقوم النظام فورياً بتحليل الصفحة وسحب كافة الفصول وتخزينها في قاعدة البيانات.
        </p>

        <form onSubmit={handleSearchAndSync} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="الصق رابط المانجا (https://...) أو اكتب اسم العمل..."
              className="w-full pl-4 pr-11 py-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#FF334B]"
            />
            {isUrlInput ? (
              <Link2 className="w-4 h-4 text-[#FF334B] absolute right-4 top-4" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-4" />
            )}
          </div>

          <button
            type="submit"
            disabled={syncingSingle}
            className="px-8 py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {syncingSingle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isUrlInput ? (
              <Globe className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>{isUrlInput ? "زحف الرابط وتخزين الفصول" : "جلب وحفظ في قاعدة البيانات"}</span>
          </button>
        </form>
      </div>

      {/* Crawled Manga in Database Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <span>الأعمال المخزنة في قاعدة البيانات ({stats.mangas.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              قائمة الأعمال التي تم سحبها وفهرسة فصولها محلياً لتقديم أسرع تجربة قراءة بدون انتظار
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 font-bold">
              <tr>
                <th className="p-4 sm:p-5">العمل</th>
                <th className="p-4 sm:p-5">المؤلف</th>
                <th className="p-4 sm:p-5">الفصول المخزنة</th>
                <th className="p-4 sm:p-5">المصدر</th>
                <th className="p-4 sm:p-5">آخر تحديث</th>
                <th className="p-4 sm:p-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading && stats.mangas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF334B]" />
                    <span>جاري تحميل قائمة الأعمال...</span>
                  </td>
                </tr>
              )}

              {!loading && stats.mangas.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    لم يتم تخزين أي أعمال بعد. استخدم أداة البحث أعلاه أو زر "Auto-Crawl" للبدء فوراً.
                  </td>
                </tr>
              )}

              {stats.mangas.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
                        {m.coverImage ? (
                          <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate font-black text-xs sm:text-sm">{m.title}</span>
                        <div className="flex gap-1 mt-1">
                          {m.genres?.slice(0, 2).map((g) => (
                            <span key={g} className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] rounded text-[10px] font-bold">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-600 dark:text-zinc-400">
                    {m.author || "غير معروف"}
                  </td>

                  <td className="p-4 sm:p-5">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black rounded-full text-xs">
                      {m.chaptersCount} فصل مخزن
                    </span>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-500 font-mono text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-bold">
                      {m.source}
                    </span>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-400 text-xs">
                    {new Date(m.updatedAt).toLocaleDateString("ar-EG")}
                  </td>

                  <td className="p-4 sm:p-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReSyncSingle(m.id)}
                        disabled={reSyncingId === m.id}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        title="إعادة مزامنة وسحب الفصول الجديدة"
                      >
                        {reSyncingId === m.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        <span>تحديث فوري</span>
                      </button>

                      <Link
                        href={`/manga/${m.id}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        title="عرض العمل بالموقع"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
