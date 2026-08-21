"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe,
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  DownloadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface SourceItem {
  id: string;
  name: string;
  baseUrl: string;
  language: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    language: "العربية",
  });

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      toast.error("فشل جلب المصادر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleCloudSync = async () => {
    try {
      setSyncingCloud(true);
      toast.loading("جاري مزامنة واستيراد كافة المصادر والسيرفرات من المستودع السحابي...", { id: "cloud-sync" });

      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-cloud" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: "cloud-sync" });
        setSources(data.sources);
      } else {
        toast.error(data.message || "فشل المزامنة", { id: "cloud-sync" });
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء المزامنة", { id: "cloud-sync" });
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.baseUrl) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تمت إضافة المصدر بنجاح!");
        setShowAddModal(false);
        setFormData({ name: "", baseUrl: "", language: "العربية" });
        fetchSources();
      } else {
        toast.error("فشل إضافة المصدر");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (sourceId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, isActive: !currentStatus }),
      });

      if (res.ok) {
        setSources((prev) =>
          prev.map((s) => (s.id === sourceId ? { ...s, isActive: !currentStatus } : s))
        );
        toast.success(`تم ${!currentStatus ? "تفعيل" : "تعطيل"} المصدر`);
      } else {
        toast.error("فشل تعديل الحالة");
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المصدر نهائياً؟")) return;

    try {
      const res = await fetch("/api/admin/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });

      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
        toast.success("تم حذف المصدر بنجاح");
      } else {
        toast.error("فشل حذف المصدر");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-8 w-full min-w-0" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-zinc-900 border border-slate-700/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-black border border-white/20">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>نظام إدارة السيرفرات والمصادر السحابية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            المصادر والسيرفرات المعربة والعالمية
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التحكم في مصادر سحب الفصول (العاشق، كين مانجا، لافا سكانز، روكس، سوات، أوليمبوس، وغيرها) وإمكانية استيراد وتفعيل المصادر بضغطة زر.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={handleCloudSync}
            disabled={syncingCloud}
            className="px-5 py-3 bg-gradient-to-l from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            {syncingCloud ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
            <span>مزامنة واستيراد المصادر السحابية</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-zinc-900 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>إضافة مصدر مخصص</span>
          </button>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h3 className="font-black text-base text-zinc-950 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span>المصادر المربوطة ({sources.length})</span>
          </h3>

          <button
            onClick={fetchSources}
            disabled={loading}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-bold">
              <tr>
                <th className="p-4 sm:p-5">اسم المصدر</th>
                <th className="p-4 sm:p-5">الرابط الأساسي</th>
                <th className="p-4 sm:p-5">اللغة</th>
                <th className="p-4 sm:p-5">الحالة</th>
                <th className="p-4 sm:p-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading && sources.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    <span>جاري تحميل المصادر...</span>
                  </td>
                </tr>
              )}

              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-zinc-950 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span>{source.name}</span>
                    </div>
                  </td>

                  <td className="p-4 sm:p-5 font-mono text-zinc-500 text-xs" dir="ltr">
                    <a
                      href={source.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{source.baseUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  <td className="p-4 sm:p-5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {source.language}
                    </span>
                  </td>

                  <td className="p-4 sm:p-5">
                    <button
                      onClick={() => handleToggleActive(source.id, source.isActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                        source.isActive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {source.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{source.isActive ? "نشط" : "معطل"}</span>
                    </button>
                  </td>

                  <td className="p-4 sm:p-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/sources/${source.id}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        معاينة الأعمال
                      </Link>

                      <button
                        onClick={() => handleDelete(source.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                        title="حذف المصدر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-zinc-950 dark:text-white">إضافة مصدر أو سيرفر جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">اسم المصدر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مانجا ليك"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">الرابط الأساسي (Base URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://mangalik.net"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">اللغة</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="العربية">العربية</option>
                  <option value="الإنجليزية">الإنجليزية</option>
                  <option value="العربية / الإنجليزية">العربية / الإنجليزية</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-l from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة المصدر"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
