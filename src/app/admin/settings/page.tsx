"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Save,
  Loader2,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Sparkles,
  Layers,
  Code2,
  Megaphone,
  Palette,
  Wrench,
  Eye,
  EyeOff,
  Database,
  Download,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/components/ThemeProvider";

export default function AdminSettingsPage() {
  const { setAccentColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbActionLoading, setDbActionLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    siteName: "ألفا مانجا",
    siteDescription: "أفضل منصة عربية احترافية لقراءة المانجا والمانهوا الكورية بأعلى جودة",
    logoUrl: "",
    faviconUrl: "",
    webAppIconUrl: "",
    headerSubtitle: "بوابة القراءة الاحترافية",
    footerText: "المنصة العربية الأولى للمانجا والمانهوا",
    developerCredit: "</> Developed by Mohamed Hashish",
    announcement: "",
    themeColor: "crimson",
    isMaintenanceMode: false,
    maintenanceMessage: "الموقع تحت أعمال الصيانة والتطوير الدوري لتحديث الفصول وتحسين الأداء. سنعود للعمل بكامل طاقتنا قريباً.",
    showSiteName: true,
    showHeaderSubtitle: true,
    showFooterText: true,
  });

  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const appIconFileRef = useRef<HTMLInputElement>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const themePalettes = [
    { id: "crimson", name: "الياقوتي القرمزي (Crimson Alpha)", color: "bg-[#FF334B]", gradient: "from-[#FF334B] to-rose-600" },
    { id: "indigo", name: "النيلي الملكي (Royal Indigo)", color: "bg-indigo-600", gradient: "from-indigo-500 to-purple-600" },
    { id: "purple", name: "البنفسجي الإمبراطوري (Imperial Purple)", color: "bg-purple-600", gradient: "from-purple-500 to-pink-600" },
    { id: "emerald", name: "الزمردي النقي (Emerald Green)", color: "bg-emerald-600", gradient: "from-emerald-500 to-teal-600" },
    { id: "amber", name: "الذهبي المشع (Sun Amber)", color: "bg-amber-600", gradient: "from-amber-500 to-orange-600" },
    { id: "cyan", name: "السايان المستقبلي (Cyber Cyan)", color: "bg-cyan-600", gradient: "from-cyan-500 to-blue-600" },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              siteName: data.siteName || "ألفا مانجا",
              siteDescription: data.siteDescription || "",
              logoUrl: data.logoUrl || "",
              faviconUrl: data.faviconUrl || "",
              webAppIconUrl: data.webAppIconUrl || "",
              headerSubtitle: data.headerSubtitle || "بوابة القراءة الاحترافية",
              footerText: data.footerText || "المنصة العربية الأولى للمانجا والمانهوا",
              developerCredit: data.developerCredit || "</> Developed by Mohamed Hashish",
              announcement: data.announcement || "",
              themeColor: data.themeColor || "crimson",
              isMaintenanceMode: data.isMaintenanceMode || false,
              maintenanceMessage: data.maintenanceMessage || "الموقع تحت أعمال الصيانة والتطوير الدوري.",
              showSiteName: typeof data.showSiteName === "boolean" ? data.showSiteName : true,
              showHeaderSubtitle: typeof data.showHeaderSubtitle === "boolean" ? data.showHeaderSubtitle : true,
              showFooterText: typeof data.showFooterText === "boolean" ? data.showFooterText : true,
            });
          }
        }
      } catch (e) {
        toast.error("فشل جلب الإعدادات");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl" | "webAppIconUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميغابايت");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      toast.success("تم اختيار الصورة بنجاح! لا تنسَ الضغط على حفظ التعديلات.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setAccentColor(formData.themeColor);
        toast.success("تم حفظ إعدادات الموقع وتطبيقها بنجاح!");
      } else {
        toast.error("فشل حفظ الإعدادات");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  // Database Backup Export
  const handleExportBackup = async () => {
    try {
      setDbActionLoading(true);
      toast.loading("جاري تصدير النسخة الاحتياطية لقاعدة البيانات...", { id: "db-backup" });
      const res = await fetch("/api/admin/database");
      if (!res.ok) throw new Error("فشل تصدير النسخة الاحتياطية");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alpha-manga-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تنزيل النسخة الاحتياطية بنجاح!", { id: "db-backup" });
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ أثناء التصدير", { id: "db-backup" });
    } finally {
      setDbActionLoading(false);
    }
  };

  // Database Restore from JSON
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setDbActionLoading(true);
        toast.loading("جاري استعادة البيانات في PostgreSQL...", { id: "db-restore" });
        const backupData = JSON.parse(event.target?.result as string);

        const res = await fetch("/api/admin/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore", backupData }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(data.message, { id: "db-restore" });
        } else {
          toast.error(data.error || "فشلت الاستعادة", { id: "db-restore" });
        }
      } catch (err: any) {
        toast.error("الملف غير صالح أو حدث خطأ في القراءة", { id: "db-restore" });
      } finally {
        setDbActionLoading(false);
        if (restoreFileRef.current) restoreFileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Database Reset Actions
  const handleExecuteReset = async (action: string) => {
    try {
      setDbActionLoading(true);
      toast.loading("جاري تنفيذ العملية على قاعدة البيانات...", { id: "db-reset" });

      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message, { id: "db-reset" });
        setShowResetModal(null);
      } else {
        toast.error(data.error || "فشلت العملية", { id: "db-reset" });
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ", { id: "db-reset" });
    } finally {
      setDbActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF334B]" />
        <p className="text-xs text-slate-500 font-bold">جاري تحميل إعدادات لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full min-w-0" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-zinc-900 border border-slate-700/60 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-black border border-white/20">
            <Sliders className="w-3.5 h-3.5 text-[#FF334B]" />
            <span>لوحة التحكم في إعدادات المنصة</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            إعدادات وثيمات الموقع
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            التحكم الشامل في هوية الموقع، الألوان الأساسية، الشعارات، وضع الصيانة، والنسخ الاحتياطي وتصفير قاعدة البيانات.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3.5 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Brand & Theme Palettes */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <Palette className="w-5 h-5 text-[#FF334B]" />
            <span>لوحة ألوان وثيمات الموقع (Brand Theme Palette)</span>
          </h2>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              اختر اللون الرئيسي الذي ترغب في اعتماده لهوية الموقع بالكامل (الأزرار، الشارات، الروابط، وأشرطة التصفح):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themePalettes.map((palette) => {
                const isSelected = formData.themeColor === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, themeColor: palette.id });
                      setAccentColor(palette.id);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-right ${
                      isSelected
                        ? "bg-slate-50 dark:bg-zinc-800/80 border-[#FF334B] shadow-md ring-2 ring-[#FF334B]/30"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${palette.color} shadow-sm shrink-0 flex items-center justify-center text-white`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        {palette.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: General Info & Visibility */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span>معلومات الموقع وظهور النصوص</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  اسم الموقع الأساسي
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showSiteName: !formData.showSiteName })}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  {formData.showSiteName ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{formData.showSiteName ? "ظاهر بالهيدر" : "مخفي بالهيدر"}</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  الوصف الفرعي (الهيدر)
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showHeaderSubtitle: !formData.showHeaderSubtitle })}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  {formData.showHeaderSubtitle ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{formData.showHeaderSubtitle ? "ظاهر بالهيدر" : "مخفي بالهيدر"}</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.headerSubtitle}
                onChange={(e) => setFormData({ ...formData, headerSubtitle: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                وصف الموقع العام (SEO Meta Description)
              </label>
              <textarea
                rows={2}
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logo, Favicon, & Web App Icon */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            <span>الشعار والأيقونات (Logo & Icons)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200 dark:border-zinc-750">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">شعار الموقع (Logo)</span>
              <div className="h-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden p-2">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">شعار AM الافتراضي الرسمي</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                className="w-full py-2 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع شعار مخصص</span>
              </button>
              <input
                type="file"
                ref={logoFileRef}
                onChange={(e) => handleFileUpload(e, "logoUrl")}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Favicon */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200 dark:border-zinc-750">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">أيقونة التبويب (Favicon)</span>
              <div className="h-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden p-2">
                {formData.faviconUrl ? (
                  <img src={formData.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">أيقونة AM للمتصفح</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => faviconFileRef.current?.click()}
                className="w-full py-2 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع Favicon</span>
              </button>
              <input
                type="file"
                ref={faviconFileRef}
                onChange={(e) => handleFileUpload(e, "faviconUrl")}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Web App Icon */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200 dark:border-zinc-750">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">أيقونة التطبيق (App Icon)</span>
              <div className="h-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden p-2">
                {formData.webAppIconUrl ? (
                  <img src={formData.webAppIconUrl} alt="App Icon" className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">أيقونة AM للتطبيق</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => appIconFileRef.current?.click()}
                className="w-full py-2 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع أيقونة التطبيق</span>
              </button>
              <input
                type="file"
                ref={appIconFileRef}
                onChange={(e) => handleFileUpload(e, "webAppIconUrl")}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Maintenance Mode */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <span>وضع الصيانة (Maintenance Mode)</span>
            </h2>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMaintenanceMode}
                onChange={(e) => setFormData({ ...formData, isMaintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
              رسالة الصيانة المعروضة للزوار
            </label>
            <textarea
              rows={2}
              value={formData.maintenanceMessage}
              onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
              className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none resize-none"
            />
          </div>
        </div>

        {/* Section 5: Database Backup, Restore & Reset */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>إدارة وصيانة قاعدة البيانات (Backup & Reset)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Export */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-750 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-500" />
                <span>تصدير نسخة احتياطية (JSON Backup)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تنزيل ملف نسخة احتياطية يحتوي على كافة المانجات، الفصول، المصادر، الإعدادات، والتعليقات.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={dbActionLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {dbActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>تحميل النسخة الاحتياطية</span>
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-750 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-500" />
                <span>استعادة نسخة احتياطية (Restore)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                رفع ملف نسخة احتياطية JSON لاسترجاع كافة البيانات المخزنة مسبقاً.
              </p>
              <button
                type="button"
                onClick={() => restoreFileRef.current?.click()}
                disabled={dbActionLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {dbActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>رفع ملف واستعادة البيانات</span>
              </button>
              <input
                type="file"
                ref={restoreFileRef}
                onChange={handleRestoreFile}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          </div>

          {/* Destructive & Maintenance Actions Area */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-xs text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>خيارات تفريغ الكاش وتصفير البيانات وإعادة التعيين:</span>
            </h4>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal("clear-chapters")}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ كاش الفصول (Clear Chapters)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal("clear-cache")}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-600 border border-purple-200 dark:border-purple-900/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إفراغ كاش القراءة والمفضلة (Clear Cache)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal("reset-sources")}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط وتحديث المصادر (Reset Sources)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal("reset-manga")}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-[#FF334B] border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف وتصفير كافة المانجا والفصول (Clean Crawler)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal("reset-community")}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تصفير المجتمع والتعليقات</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal("factory-reset")}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>استعادة ضبط المصنع الشامل (Factory Reset)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Footer & Developer Credit */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <Code2 className="w-5 h-5 text-amber-500" />
            <span>نصوص الفوتر وحقوق المطور والإعلانات</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                نص وصف الفوتر (Footer Description)
              </label>
              <input
                type="text"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                شارة حقوق المطور (Developer Credit)
              </label>
              <input
                type="text"
                value={formData.developerCredit}
                onChange={(e) => setFormData({ ...formData, developerCredit: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none font-mono text-left"
                dir="ltr"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-rose-500" />
                <span>شريط الإعلانات والتنبيهات العامة (اختياري - يظهر أعلى الموقع)</span>
              </label>
              <input
                type="text"
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                placeholder="مثال: مرحباً بكم في التحديث الجديد لمنصة ألفا مانجا!"
                className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>حفظ كافة التعديلات وتطبيقها فوراً</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>تأكيد الإجراء على قاعدة البيانات</span>
              </h3>
              <button onClick={() => setShowResetModal(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              {showResetModal === "clear-chapters" && "هل أنت متأكد من تفريغ كافة الفصول المخزنة؟ سيتم إعادة سحب الفصول تلقائياً عند طلب قراءتها."}
              {showResetModal === "clear-cache" && "هل أنت متأكد من إفراغ كاش الصفحات وسجل القراءة والمفضلة؟"}
              {showResetModal === "reset-sources" && "هل أنت متأكد من إعادة ضبط قائمة المصادر ومزامنتها مع المصادر الافتراضية المعتمدة؟"}
              {showResetModal === "reset-manga" && "هل أنت متأكد من حذف كافة أعمال المانجا والفصول وسجل القراءة والمفضلة؟ هذا الإجراء لا يمكن التراجع عنه."}
              {showResetModal === "reset-community" && "هل أنت متأكد من حذف كافة منشورات المجتمع والتعليقات والإعجابات؟"}
              {showResetModal === "factory-reset" && "تحذير: سيتم حذف كافة المحتويات وإعادة الموقع لضبط المصنع النظيف مع الحفاظ على حسابك كمدير فقط."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleExecuteReset(showResetModal)}
                disabled={dbActionLoading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                {dbActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>نعم، نفذ الإجراء</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
