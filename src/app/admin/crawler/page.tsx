"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  RefreshCw,
  Search,
  Sparkles,
  Database,
  Layers,
  Loader2,
  BookOpen,
  Zap,
  ArrowDownToLine,
  ExternalLink,
  Globe,
  Link2,
  Trash2,
  Edit3,
  Plus,
  X,
  Save,
  Check,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { getSafeImageUrl } from "@/lib/imageUtils";

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

interface SearchSourceItem {
  id: string;
  title: string;
  url?: string;
  coverImage?: string;
  source: string;
  latestChapter?: string;
  language?: "ar" | "en";
}

interface ChapterItem {
  id: string;
  title: string;
  chapterNum: number;
  pages?: string[];
  createdAt: string;
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

  // Multi-source search state
  const [searchingSources, setSearchingSources] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchSourceItem[]>([]);
  const [importingUrl, setImportingUrl] = useState<string | null>(null);

  // Filter stored manga
  const [filterQuery, setFilterQuery] = useState("");

  // Batch / Multi-selection state
  const [selectedMangaIds, setSelectedMangaIds] = useState<string[]>([]);
  const [customSelectCount, setCustomSelectCount] = useState("5");
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Edit Manga Modal State
  const [editingManga, setEditingManga] = useState<StoredManga | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    author: "",
    status: "مستمر",
    coverImage: "",
    source: "",
    genres: "",
    description: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Manage Chapters Modal State
  const [chapterModalManga, setChapterModalManga] = useState<StoredManga | null>(null);
  const [chapterList, setChapterList] = useState<ChapterItem[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

  // Add Chapter Form inside Modal
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterNum, setNewChapterNum] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);

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

  const isUrlInput =
    searchQuery.trim().startsWith("http://") || searchQuery.trim().startsWith("https://");

  // Search across Arabic & Global sources
  const handleLiveSearchSources = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("يرجى إدخال اسم العمل أو الرابط المباشر للبحث");
      return;
    }

    if (isUrlInput) {
      // Direct URL Import
      handleDirectUrlSync(searchQuery.trim());
      return;
    }

    try {
      setSearchingSources(true);
      setSearchResults([]);
      toast.loading("جاري البحث الذكي عبر المصادر والمترجمين...", {
        id: "search-toast",
      });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search-sources",
          query: searchQuery.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.results) {
        setSearchResults(data.results);
        if (data.results.length === 0) {
          toast.error("لم يتم العثور على نتائج. يمكنك تجربة لصق رابط المانجا المباشر.", {
            id: "search-toast",
          });
        } else {
          toast.success(`تم العثور على ${data.results.length} أعمال متطابقة!`, {
            id: "search-toast",
          });
        }
      } else {
        toast.error(data.message || "فشل البحث في المصادر", { id: "search-toast" });
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء البحث", { id: "search-toast" });
    } finally {
      setSearchingSources(false);
    }
  };

  // Direct URL or Target Manga Import
  const handleDirectUrlSync = async (
    target: string,
    customSource?: string,
    targetLang?: string
  ) => {
    const isUrl = target.startsWith("http://") || target.startsWith("https://");
    try {
      setImportingUrl(target);
      setSyncingSingle(true);
      toast.loading("جاري سحب كافة الفصول والصفحات وتخزينها في قاعدة البيانات...", {
        id: "import-toast",
      });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isUrl ? "sync-url" : "sync-single",
          url: isUrl ? target.trim() : undefined,
          mangaId: !isUrl ? target.trim() : undefined,
          source: customSource,
          language: targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: "import-toast", duration: 5000 });
        setSearchQuery("");
        setSearchResults([]);
        fetchStatus();
      } else {
        toast.error(data.message || "فشل قراءة الرابط وحفظ الفصول", { id: "import-toast" });
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم", { id: "import-toast" });
    } finally {
      setImportingUrl(null);
      setSyncingSingle(false);
    }
  };

  // Auto-Crawl Popular Arabic
  const handleBulkSync = async () => {
    try {
      setSyncingBulk(true);
      toast.loading("جاري سحب وحفظ أشهر الأعمال المعربة بجميع فصولها...", { id: "bulk-toast" });

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

  // Sync All Tracked
  const handleSyncAllTracked = async () => {
    if (!confirm("هل تريد مزامنة وتحديث كافة الفصول لجميع الأعمال المحفوظة بقاعدة البيانات؟"))
      return;

    try {
      setSyncingAll(true);
      toast.loading("جاري فحص وتحديث فصول كافة الأعمال في قاعدة البيانات...", {
        id: "sync-all-toast",
      });

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

  // Re-sync single manga
  const handleReSyncSingle = async (mangaId: string) => {
    try {
      setReSyncingId(mangaId);
      toast.loading("جاري تحديث فصول هذا العمل من مصدره الأصلي...", {
        id: `resync-${mangaId}`,
      });

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

  // Delete Single Manga
  const handleDeleteManga = async (mangaId: string, title: string) => {
    if (
      !confirm(
        `هل أنت متأكد من رغبتك في حذف مانجا "${title}" وجميع فصولها نهائياً من قاعدة البيانات؟`
      )
    )
      return;

    try {
      toast.loading("جاري حذف العمل...", { id: `del-${mangaId}` });
      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-manga", mangaId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "تم حذف العمل بنجاح", { id: `del-${mangaId}` });
        setSelectedMangaIds((prev) => prev.filter((id) => id !== mangaId));
        fetchStatus();
      } else {
        toast.error(data.message || "فشل الحذف", { id: `del-${mangaId}` });
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف", { id: `del-${mangaId}` });
    }
  };

  // Filtered stored manga
  const filteredMangas = stats.mangas.filter(
    (m) =>
      m.title?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.author?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.source?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Selection handlers
  const handleToggleSelectOne = (id: string) => {
    setSelectedMangaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectTopN = (count: number) => {
    const countToTake = Math.max(1, count);
    const ids = filteredMangas.slice(0, countToTake).map((m) => m.id);
    setSelectedMangaIds(ids);
    toast.success(`تم تحديد ${ids.length} أعمال ✓`);
  };

  const handleToggleSelectAll = () => {
    if (selectedMangaIds.length === filteredMangas.length && filteredMangas.length > 0) {
      setSelectedMangaIds([]);
    } else {
      setSelectedMangaIds(filteredMangas.map((m) => m.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedMangaIds([]);
  };

  // Batch Delete Selected Manga
  const handleBulkDeleteSelected = async () => {
    if (selectedMangaIds.length === 0) {
      toast.error("يرجى تحديد أعمال لحذفها");
      return;
    }

    if (
      !confirm(
        `⚠️ تحذير: هل أنت متأكد من رغبتك في حذف ${selectedMangaIds.length} أعمال محددة وجميع فصولها وصفحاتها نهائياً من قاعدة البيانات؟`
      )
    ) {
      return;
    }

    try {
      setDeletingBulk(true);
      toast.loading(`جاري حذف ${selectedMangaIds.length} أعمال من قاعدة البيانات...`, {
        id: "bulk-del-toast",
      });

      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-multiple-manga",
          mangaIds: selectedMangaIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `تم حذف ${selectedMangaIds.length} أعمال بنجاح!`, {
          id: "bulk-del-toast",
          duration: 5000,
        });
        setSelectedMangaIds([]);
        fetchStatus();
      } else {
        toast.error(data.message || "فشل حذف الأعمال المحددة", { id: "bulk-del-toast" });
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف", { id: "bulk-del-toast" });
    } finally {
      setDeletingBulk(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (m: StoredManga) => {
    setEditingManga(m);
    setEditFormData({
      title: m.title || "",
      author: m.author || "",
      status: m.status || "مستمر",
      coverImage: m.coverImage || "",
      source: m.source || "",
      genres: Array.isArray(m.genres) ? m.genres.join(", ") : "",
      description: "",
    });
  };

  // Save Edit Manga
  const handleSaveEditManga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManga) return;

    try {
      setSavingEdit(true);
      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit-manga",
          mangaId: editingManga.id,
          data: {
            title: editFormData.title.trim(),
            author: editFormData.author.trim(),
            status: editFormData.status,
            coverImage: editFormData.coverImage.trim(),
            source: editFormData.source.trim(),
            genres: editFormData.genres
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تم تحديث بيانات العمل بنجاح!");
        setEditingManga(null);
        fetchStatus();
      } else {
        toast.error(data.message || "فشل تحديث البيانات");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Manage Chapters Modal
  const handleOpenChapters = async (m: StoredManga) => {
    setChapterModalManga(m);
    setLoadingChapters(true);
    setShowAddChapter(false);
    try {
      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-manga-chapters",
          mangaId: m.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.chapters) {
        setChapterList(data.chapters);
      }
    } catch (e) {
      toast.error("فشل جلب فصول العمل");
    } finally {
      setLoadingChapters(false);
    }
  };

  // Delete Individual Chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل؟")) return;

    try {
      setDeletingChapterId(chapterId);
      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-chapter",
          chapterId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChapterList((prev) => prev.filter((c) => c.id !== chapterId));
        toast.success("تم حذف الفصل بنجاح");
        fetchStatus();
      } else {
        toast.error(data.message || "فشل حذف الفصل");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeletingChapterId(null);
    }
  };

  // Add Manual Chapter
  const handleAddManualChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterModalManga || !newChapterTitle || !newChapterNum) {
      toast.error("يرجى إدخال عنوان ورقم الفصل");
      return;
    }

    try {
      setAddingChapter(true);
      const res = await fetch("/api/admin/crawler/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-chapter",
          mangaId: chapterModalManga.id,
          data: {
            title: newChapterTitle.trim(),
            chapterNum: parseFloat(newChapterNum),
            pages: [],
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تمت إضافة الفصل بنجاح!");
        setChapterList((prev) => [data.chapter, ...prev]);
        setNewChapterTitle("");
        setNewChapterNum("");
        setShowAddChapter(false);
        fetchStatus();
      } else {
        toast.error(data.message || "فشل إضافة الفصل");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء إضافة الفصل");
    } finally {
      setAddingChapter(false);
    }
  };

  const isAllSelected =
    filteredMangas.length > 0 && selectedMangaIds.length === filteredMangas.length;

  return (
    <div className="space-y-8 w-full min-w-0 pb-28" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-zinc-900 border border-slate-700/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-black border border-white/20">
            <Bot className="w-3.5 h-3.5 text-[#FF334B]" />
            <span>نظام الجلب الذكي الشامل وإدارة الفصول (Universal Manga Manager & Scraper)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            محرك جلب وإدارة المانجات والفصول العربية بقاعدة البيانات
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            البحث الذكي: إذا كتبت باللغة العربية يجلب العمل معرباً بالكامل من كافة المصادر، وإذا كتبت بالإنجليزية يجلب العمل بالإنجليزية مع تخزين دائم في PostgreSQL.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={handleBulkSync}
            disabled={syncingBulk}
            className="px-5 py-3 bg-[#FF334B] hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
          >
            {syncingBulk ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
            <span>سحب الأعمال المعربة (Auto-Crawl)</span>
          </button>

          <button
            onClick={handleSyncAllTracked}
            disabled={syncingAll}
            className="px-5 py-3 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            {syncingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-600" />
            )}
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
              المانجات المحفوظة محلياً
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
              إجمالي الفصول المخزنة والمتاحة
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
              حالة التخزين الدائم
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              PostgreSQL Active ✓
            </h3>
          </div>
        </div>
      </div>

      {/* Universal Search & Link Scraper Tool */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-black text-base sm:text-lg text-slate-950 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#FF334B]" />
            <span>البحث المباشر في المصادر أو لصق رابط المانجا</span>
          </h2>
          {isUrlInput && (
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Link2 className="w-3.5 h-3.5" />
              <span>تم التعرف على رابط مباشر (DOM Parser Ready)</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-zinc-400">
          اكتب <strong>اسم المانجا بالعربية أو الإنجليزية</strong> (مثل: <em>ون بيس، سولو ليفلينج، ناروتو، Solo Leveling</em>) للبحث عبر جميع فرق الترجمة العربية المعتمدة، أو <strong>الصق رابط العمل كاملاً</strong> لسحبه فوراً وتخزين كافة فصوله في قاعدة البيانات.
        </p>

        <form onSubmit={handleLiveSearchSources} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المانجا (عربي/إنجليزي) أو الصق رابط العمل المباشر..."
              className="w-full pl-4 pr-11 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#FF334B]"
            />
            {isUrlInput ? (
              <Link2 className="w-5 h-5 text-[#FF334B] absolute right-4 top-4" />
            ) : (
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-4" />
            )}
          </div>

          <button
            type="submit"
            disabled={searchingSources || syncingSingle}
            className="px-8 py-4 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {searchingSources || syncingSingle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isUrlInput ? (
              <Globe className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isUrlInput ? "زحف وسحب الرابط" : "بحث في كافة المصادر"}</span>
          </button>
        </form>

        {/* Live Multi-Source Search Results Grid */}
        {searchResults.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>نتائج البحث المتاحة للسحب ({searchResults.length})</span>
              </h3>
              <button
                onClick={() => setSearchResults([])}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                إغلاق النتائج
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map((item, idx) => {
                const targetKey = item.url || item.id;
                const isImportingThis = importingUrl === targetKey;

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl flex flex-col justify-between gap-3 group hover:border-[#FF334B] transition-all"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-20 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                        {item.coverImage ? (
                          <img
                            src={getSafeImageUrl(item.coverImage)}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] text-[10px] font-bold">
                            {item.source}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[9px] font-bold">
                            {item.language === "ar" ? "عربي" : "English"}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h4>
                        {item.latestChapter && (
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">
                            {item.latestChapter}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDirectUrlSync(targetKey, item.source, item.language)}
                      disabled={importingUrl !== null}
                      className="w-full py-2 bg-[#FF334B] hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      {isImportingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isImportingThis ? "جاري السحب والتخزين..." : "سحب وحفظ في قاعدة البيانات"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Database Manga Management Table with Batch Selection & Deletion */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FF334B]" />
              <span>الأعمال المخزنة في قاعدة البيانات ({filteredMangas.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              حدد عدداً معيناً من الأعمال لحذفها بشكل مباشر، أو عدل تفاصيل وفصول أي عمل
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter in Stored Manga */}
            <div className="relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="تصفية المخزون..."
                className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#FF334B] w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
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
        </div>

        {/* Quick Batch Selection Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              تحديد سريع:
            </span>

            <button
              onClick={() => handleSelectTopN(5)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200"
            >
              أول 5 أعمال
            </button>

            <button
              onClick={() => handleSelectTopN(10)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200"
            >
              أول 10 أعمال
            </button>

            <button
              onClick={() => handleSelectTopN(25)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200"
            >
              أول 25 عمل
            </button>

            <button
              onClick={handleToggleSelectAll}
              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-bold text-[#FF334B]"
            >
              {isAllSelected ? "إلغاء تحديد الكل" : "تحديد كافة الأعمال"}
            </button>

            {/* Custom Count Input */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-xs text-slate-500 font-bold">تحديد عدد:</span>
              <input
                type="number"
                min="1"
                max={filteredMangas.length}
                value={customSelectCount}
                onChange={(e) => setCustomSelectCount(e.target.value)}
                className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-center outline-none focus:ring-1 focus:ring-[#FF334B]"
              />
              <button
                onClick={() => handleSelectTopN(parseInt(customSelectCount) || 1)}
                className="px-3 py-1 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-900 dark:text-white rounded-lg text-xs font-bold"
              >
                تطبيق
              </button>
            </div>
          </div>

          {/* Selected Count & Direct Delete Button */}
          {selectedMangaIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-[#FF334B] bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                تم تحديد: {selectedMangaIds.length} من {filteredMangas.length}
              </span>

              <button
                onClick={handleBulkDeleteSelected}
                disabled={deletingBulk}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                {deletingBulk ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>حذف الأعمال المحددة ({selectedMangaIds.length})</span>
              </button>

              <button
                onClick={handleClearSelection}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                إلغاء التحديد
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 font-bold">
              <tr>
                <th className="p-4 sm:p-5 w-12 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="p-1 hover:text-[#FF334B] transition-colors"
                    title={isAllSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#FF334B]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4 sm:p-5">العمل</th>
                <th className="p-4 sm:p-5">المؤلف</th>
                <th className="p-4 sm:p-5">الفصول</th>
                <th className="p-4 sm:p-5">المصدر</th>
                <th className="p-4 sm:p-5">الحالة</th>
                <th className="p-4 sm:p-5 text-left">لوحة التحكم والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {loading && stats.mangas.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF334B]" />
                    <span>جاري تحميل قائمة الأعمال...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredMangas.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    لم يتم العثور على أي أعمال مطابقة. استخدم شريط البحث أعلاه لسحب أعمال جديدة.
                  </td>
                </tr>
              )}

              {filteredMangas.map((m) => {
                const isSelected = selectedMangaIds.includes(m.id);

                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-rose-50/50 dark:bg-rose-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Checkbox cell */}
                    <td className="p-4 sm:p-5 text-center">
                      <button
                        onClick={() => handleToggleSelectOne(m.id)}
                        className="p-1 text-slate-400 hover:text-[#FF334B]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#FF334B]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 shadow-sm">
                          {m.coverImage ? (
                            <img
                              src={getSafeImageUrl(m.coverImage)}
                              alt={m.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <span className="block truncate font-black text-xs sm:text-sm">
                            {m.title}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.genres?.slice(0, 2).map((g) => (
                              <span
                                key={g}
                                className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] rounded text-[10px] font-bold"
                              >
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
                      <button
                        onClick={() => handleOpenChapters(m)}
                        className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-[#FF334B] hover:bg-rose-100 font-black rounded-full text-xs transition-colors flex items-center gap-1"
                        title="عرض وإدارة الفصول"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{m.chaptersCount} فصل</span>
                      </button>
                    </td>

                    <td className="p-4 sm:p-5 text-slate-500 font-mono text-xs">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-bold">
                        {m.source}
                      </span>
                    </td>

                    <td className="p-4 sm:p-5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {m.status || "مستمر"}
                      </span>
                    </td>

                    <td className="p-4 sm:p-5 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Manage Chapters */}
                        <button
                          onClick={() => handleOpenChapters(m)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="إدارة الفصول"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {/* Edit Manga Details */}
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                          title="تعديل بيانات العمل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Re-sync */}
                        <button
                          onClick={() => handleReSyncSingle(m.id)}
                          disabled={reSyncingId === m.id}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                          title="مزامنة الفصول الجديدة"
                        >
                          {reSyncingId === m.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>

                        {/* Delete Single Manga */}
                        <button
                          onClick={() => handleDeleteManga(m.id, m.title)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="حذف المانجا وفصولها نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* View on site */}
                        <Link
                          href={`/manga/${m.id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          title="عرض العمل بالموقع"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Sticky Action Bar when items are selected */}
      {selectedMangaIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-zinc-950/95 backdrop-blur-md border border-slate-700 dark:border-zinc-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF334B] animate-ping" />
            <span className="text-xs sm:text-sm font-bold">
              تم تحديد <strong className="text-[#FF334B]">{selectedMangaIds.length}</strong> أعمال
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 dark:bg-zinc-800" />

          <button
            onClick={handleBulkDeleteSelected}
            disabled={deletingBulk}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center gap-1.5"
          >
            {deletingBulk ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>حذف المحدد الآن</span>
          </button>

          <button
            onClick={handleClearSelection}
            className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Edit Manga Modal */}
      {editingManga && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>تعديل بيانات العمل</span>
              </h3>
              <button
                onClick={() => setEditingManga(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditManga} className="p-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  عنوان المانجا
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    المؤلف
                  </label>
                  <input
                    type="text"
                    value={editFormData.author}
                    onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                  >
                    <option value="مستمر">مستمر</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="متوقف">متوقف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  رابط صورة الغلاف (Cover Image URL)
                </label>
                <input
                  type="text"
                  value={editFormData.coverImage}
                  onChange={(e) => setEditFormData({ ...editFormData, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  المصدر
                </label>
                <input
                  type="text"
                  value={editFormData.source}
                  onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  التصنيفات (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={editFormData.genres}
                  onChange={(e) => setEditFormData({ ...editFormData, genres: e.target.value })}
                  placeholder="أكشن, مغامرة, مانهوا, خيال"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingManga(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 bg-[#FF334B] hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Chapters Modal */}
      {chapterModalManga && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF334B]" />
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    إدارة فصول: {chapterModalManga.title}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    إجمالي الفصول: {chapterList.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddChapter(!showAddChapter)}
                  className="px-3 py-1.5 bg-[#FF334B] hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فصل يدوي</span>
                </button>

                <button
                  onClick={() => setChapterModalManga(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add Chapter Form */}
            {showAddChapter && (
              <form
                onSubmit={handleAddManualChapter}
                className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    عنوان الفصل
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الفصل 1: البداية"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    رقم الفصل
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="1"
                    value={newChapterNum}
                    onChange={(e) => setNewChapterNum(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingChapter}
                    className="flex-1 py-2 bg-[#FF334B] hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    {addingChapter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>إضافة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChapter(false)}
                    className="px-3 py-2 bg-slate-200 dark:bg-zinc-700 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingChapters ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF334B]" />
                  <span>جاري تحميل قائمة الفصول...</span>
                </div>
              ) : chapterList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  لا توجد فصول مخزنة لهذا العمل. استخدم زر المزامنة أو أضف فصلاً يدوياً.
                </div>
              ) : (
                chapterList.map((chap) => (
                  <div
                    key={chap.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-750 rounded-xl flex items-center justify-between gap-3 group hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] font-black text-xs flex items-center justify-center shrink-0">
                        {chap.chapterNum}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                          {chap.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {chap.pages?.length ? `${chap.pages.length} صفحة مخزنة` : "سيتم سحب الصفحات عند القراءة"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/manga/${chapterModalManga.id}/chapter/${chap.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-[#FF334B] dark:hover:text-[#FF334B] rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        title="قراءة الفصل"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDeleteChapter(chap.id)}
                        disabled={deletingChapterId === chap.id}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="حذف الفصل"
                      >
                        {deletingChapterId === chap.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
