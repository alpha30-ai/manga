"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      setLoading(true);
      await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      setNotifications([]);
      toast.success("تم مسح جميع الإشعارات");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes("حذف") || title.includes("حرج") || title.includes("خطر")) {
      return {
        icon: ShieldAlert,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        label: "تحذير حرج",
      };
    }
    if (title.includes("دخول") || title.includes("أمان") || title.includes("تحذير")) {
      return {
        icon: AlertTriangle,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        label: "تنبيه أمان",
      };
    }
    if (title.includes("تأكيد") || title.includes("تفعيل") || title.includes("مرحباً")) {
      return {
        icon: ShieldCheck,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        label: "تأكيد وتفعيل",
      };
    }
    if (title.includes("فصل") || title.includes("مانجا")) {
      return {
        icon: BookOpen,
        color: "text-[#FF334B] bg-rose-500/10 border-rose-500/30",
        label: "تحديث مانجا",
      };
    }
    return {
      icon: Info,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
      label: "إشعار نظام",
    };
  };

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[#FF334B] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 animate-pulse">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Full Screen Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Centered on Mobile Screen Below Header / Anchored Popover on Desktop */}
          <div className="fixed sm:absolute top-20 sm:top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 sm:mt-2 w-[92vw] sm:w-96 max-w-sm sm:max-w-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Pure Light in Light Mode, Pure Dark in Dark Mode */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-950 dark:text-white">مركز الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] font-bold rounded-full border border-rose-200 dark:border-rose-900/50">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs text-[#FF334B] hover:underline flex items-center gap-1 font-bold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    قراءة الكل
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="مسح الكل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600" />
                  <p className="text-sm font-bold">لا توجد إشعارات حالياً</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const typeInfo = getNotificationIcon(notif.title);
                  const IconComponent = typeInfo.icon;

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer ${
                        !notif.isRead ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                      }`}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${typeInfo.color} shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold shrink-0">
                              {typeInfo.label}
                            </span>
                          </div>

                          {notif.link ? (
                            <Link
                              href={notif.link}
                              onClick={() => setIsOpen(false)}
                              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-[#FF334B] dark:hover:text-[#FF334B] line-clamp-2"
                            >
                              {notif.message}
                            </Link>
                          ) : (
                            <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">
                              {notif.message}
                            </p>
                          )}

                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 block">
                            {new Date(notif.createdAt).toLocaleDateString("ar-EG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
