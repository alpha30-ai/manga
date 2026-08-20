"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  History,
  Bookmark,
  Bell,
  Settings,
  User,
  ShieldCheck,
  Calendar,
  BookOpen,
  Trash2,
  Play,
  KeyRound,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  LogOut,
  Camera,
  Upload,
} from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface ProfileDashboardProps {
  user: any;
  history: any[];
  favorites: any[];
  notifications: any[];
  settings: any;
}

export default function ProfileDashboard({
  user,
  history: initialHistory,
  favorites: initialFavorites,
  notifications: initialNotifications,
  settings,
}: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<"history" | "favorites" | "notifications" | "settings">("history");
  const [historyList, setHistoryList] = useState(initialHistory);
  const [favoritesList, setFavoritesList] = useState(initialFavorites);
  const [notificationsList, setNotificationsList] = useState(initialNotifications);
  const [avatarImage, setAvatarImage] = useState<string | null>(user?.image || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [readerMode, setReaderMode] = useState(settings?.readerMode || "vertical");
  const [fitMode, setFitMode] = useState(settings?.fitMode || "width");
  const [theme, setTheme] = useState(settings?.theme || "system");
  const [savingSettings, setSavingSettings] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"request" | "verify">("request");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميغابايت");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatarImage(base64);
      try {
        setUploadingAvatar(true);
        const res = await fetch("/api/user/upload-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("تم تحديث صورتك الشخصية بنجاح!");
        } else {
          toast.error(data.message || "فشل تحديث الصورة");
        }
      } catch (err) {
        toast.error("حدث خطأ أثناء رفع الصورة");
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readerMode, fitMode, theme }),
      });
      if (res.ok) {
        toast.success("تم حفظ إعدادات القارئ بنجاح!");
      } else {
        toast.error("فشل حفظ الإعدادات");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في مسح سجل القراءة بالكامل؟")) return;
    try {
      const res = await fetch("/api/user/history", { method: "DELETE" });
      if (res.ok) {
        setHistoryList([]);
        toast.success("تم مسح سجل القراءة بنجاح");
      }
    } catch (e) {
      toast.error("فشل مسح السجل");
    }
  };

  const handleRemoveHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/user/history?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistoryList(historyList.filter((item: any) => item.id !== id));
        toast.success("تم الحذف من السجل");
      }
    } catch (e) {
      toast.error("فشل الحذف");
    }
  };

  const handleRemoveFavorite = async (mangaId: string) => {
    try {
      const res = await fetch(`/api/user/favorites?mangaId=${mangaId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavoritesList(favoritesList.filter((fav: any) => fav.manga.id !== mangaId));
        toast.success("تمت الإزالة من المفضلة");
      }
    } catch (e) {
      toast.error("فشل الحذف من المفضلة");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotificationsList(
          notificationsList.map((n: any) => (n.id === id ? { ...n, isRead: true } : n))
        );
        toast.success("تم تعليم الإشعار كمقروء");
      }
    } catch (e) {
      toast.error("فشل التحديث");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "تم تغيير كلمة المرور بنجاح");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "حدث خطأ");
      }
    } catch (e) {
      toast.error("فشل تغيير كلمة المرور");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteRequest = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "تم إرسال كود التأكيد لبريدك");
        setDeleteStep("verify");
      } else {
        toast.error(data.message || "فشل إرسال الكود");
      }
    } catch (e) {
      toast.error("حدث خطأ");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOtp) {
      toast.error("يرجى إدخال كود التأكيد");
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", otp: deleteOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم حذف حسابك بنجاح");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error(data.message || "الكود غير صحيح");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* User Header Profile Card - High Contrast in Light and Dark Mode */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-right">
          {/* Avatar with Upload button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-[#FF334B] via-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-rose-500/20 border-2 border-white dark:border-zinc-700">
              {avatarImage ? (
                <img src={avatarImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>

            {/* Upload Overlay Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-xs font-bold gap-1 cursor-pointer"
              title="تغيير الصورة الشخصية"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>تغيير</span>
                </>
              )}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                {user?.name || "مستخدم ألفا"}
              </h1>
              {user?.role === "ADMIN" ? (
                <span className="px-3 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مدير النظام
                </span>
              ) : (
                <span className="px-3 py-0.5 text-xs font-bold bg-rose-500/15 text-[#FF334B] border border-rose-500/30 rounded-full">
                  قارئ عضو
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400" dir="ltr">
              {user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF334B]" />
                <span>
                  انضم في: {new Date(user?.createdAt || Date.now()).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-[#FF334B] text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* User Stats Banner - Crisp Light & Dark Mode */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 text-center border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">فصول مقروءة</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">{historyList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 text-center border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">في المفضلة</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{favoritesList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 text-center border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">الإشعارات</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{notificationsList.length}</span>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 text-center border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block mb-1">حالة الحساب</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">نشط ومفعل ✓</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          { id: "history", label: "سجل القراءة", icon: History, count: historyList.length },
          { id: "favorites", label: "المفضلة والمكتبة", icon: Bookmark, count: favoritesList.length },
          { id: "notifications", label: "الإشعارات", icon: Bell, count: notificationsList.filter((n: any) => !n.isRead).length },
          { id: "settings", label: "الإعدادات والأمان", icon: Settings },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                isActive
                  ? "bg-gradient-to-l from-[#FF334B] to-rose-600 text-white shadow-lg shadow-rose-500/25"
                  : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/90 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-rose-100 dark:bg-rose-950/60 text-[#FF334B]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Reading History */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#FF334B]" />
              <span>آخر ما قرأته ({historyList.length})</span>
            </h2>
            {historyList.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح السجل بالكامل</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {historyList.map((item: any) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-4 flex gap-4 hover:shadow-lg transition-all relative group"
              >
                <div className="w-20 h-28 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 relative shadow-sm">
                  {item.manga?.coverImage ? (
                    <img
                      src={item.manga.coverImage}
                      alt={item.manga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white truncate">
                      {item.manga?.title || "مانجا"}
                    </h3>
                    <p className="text-xs text-[#FF334B] font-bold">
                      {item.chapter?.title || "الفصل الحالي"}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      الصفحة: {item.pageNumber || 1} • {new Date(item.updatedAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={`/manga/${item.mangaId}/chapter/${item.chapterId}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>متابعة</span>
                    </Link>
                    <button
                      onClick={() => handleRemoveHistory(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="حذف من السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {historyList.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">سجل القراءة فارغ</h3>
                <p className="text-xs text-slate-500">ابدأ بقراءة الفصول وسيتم حفظ تقدمك تلقائياً هنا.</p>
                <Link
                  href="/browse"
                  className="inline-block mt-2 px-5 py-2.5 bg-[#FF334B] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  استكشف المانجا الآن
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Favorites / Library */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>الأعمال المفضلة في مكتبتك ({favoritesList.length})</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {favoritesList.map((fav: any) => (
              <div
                key={fav.id}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800/80 hover:shadow-xl transition-all relative"
              >
                <Link href={`/manga/${fav.manga.id}`} className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {fav.manga?.coverImage ? (
                    <img
                      src={fav.manga.coverImage}
                      alt={fav.manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFavorite(fav.manga.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-xl transition-colors"
                    title="إزالة من المفضلة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <div className="p-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {fav.manga?.title}
                  </h3>
                </div>
              </div>
            ))}

            {favoritesList.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">لا توجد أعمال في المفضلة</h3>
                <p className="text-xs text-slate-500">أضف مانجاتك المفضلة لتصل إليها بسهولة وتتلقى إشعارات بالفصول الجديدة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            <span>الإشعارات والتحديثات ({notificationsList.length})</span>
          </h2>

          <div className="space-y-3">
            {notificationsList.map((notif: any) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  notif.isRead
                    ? "bg-slate-50 dark:bg-zinc-800/40 border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                    : "bg-white dark:bg-zinc-900 border-[#FF334B]/30 shadow-sm text-slate-900 dark:text-white"
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{notif.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(notif.createdAt).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold rounded-xl shrink-0"
                  >
                    تعليم كمقروء
                  </button>
                )}
              </div>
            ))}

            {notificationsList.length === 0 && (
              <div className="py-16 text-center space-y-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80">
                <Bell className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">لا توجد إشعارات جديدة</h3>
                <p className="text-xs text-slate-500">ستظهر هنا التنبيهات عند صدور فصول جديدة لمانجاتك المفضلة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Settings & Security */}
      {activeTab === "settings" && (
        <div className="space-y-8">
          {/* Reader Preferences Form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#FF334B]" />
              <span>تفضيلات القارئ والعرض</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    نمط القراءة الافتراضي
                  </label>
                  <select
                    value={readerMode}
                    onChange={(e) => setReaderMode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#FF334B]"
                  >
                    <option value="vertical">شريطي طولي (Webtoon Scroll)</option>
                    <option value="horizontal-rtl">صفحات أفقي (من اليمين لليسار - مانجا)</option>
                    <option value="horizontal-ltr">صفحات أفقي (من اليسار لليمين - مانهوا/كوميكس)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    ملاءمة حجم الصور
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#FF334B]"
                  >
                    <option value="width">ملاءمة العرض (Fit Width)</option>
                    <option value="height">ملاءمة الارتفاع (Fit Height)</option>
                    <option value="original">الحجم الأصلي (Original Size)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    الثيم الافتراضي
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#FF334B]"
                  >
                    <option value="system">حسب إعدادات النظام</option>
                    <option value="dark">الوضع الليلي (Dark)</option>
                    <option value="light">الوضع النهاري (Light)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-gradient-to-l from-[#FF334B] to-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>حفظ تفضيلات القارئ</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>تغيير كلمة المرور والأمان</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#FF334B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>تحديث كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>

          {/* Delete Account Section */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-black text-base text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>منطقة الخطر: حذف الحساب نهائياً</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              حذف الحساب سيؤدي إلى مسح سجل القراءة، قائمة المفضلة، وجميع التعليقات والبيانات المرتبطة بك نهائياً بدون إمكانية للاسترجاع.
            </p>

            <button
              onClick={() => {
                setShowDeleteModal(true);
                handleDeleteRequest();
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all"
            >
              طلب حذف الحساب
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>تأكيد حذف الحساب</span>
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-400">
              <p>تم إرسال كود تأكيد مكون من 6 أرقام إلى بريدك الإلكتروني <strong>{user?.email}</strong>. أدخل الكود لتأكيد الحذف النهائي.</p>

              <input
                type="text"
                maxLength={6}
                value={deleteOtp}
                onChange={(e) => setDeleteOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl"
                dir="ltr"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingAccount || deleteOtp.length !== 6}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>حذف الحساب نهائياً</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
