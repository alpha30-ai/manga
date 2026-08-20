"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
  MessageSquare,
  Search,
  Filter,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error("فشل جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, status: string, adminNote?: string) => {
    try {
      setUpdatingId(requestId);
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status, adminNote }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "تم التحديث بنجاح!");
        fetchRequests();
      } else {
        toast.error(data.message || "فشل التحديث");
      }
    } catch (e) {
      toast.error("حدث خطأ");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 w-full min-w-0" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-[#FF334B]" />
            <span>إدارة طلبات ومقترحات القراء</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            مراجعة طلبات إضافة المانجا، البلاغات عن الفصول التالفة، وتحديث حالتها مع إشعار المستخدم فورياً
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "كافة الطلبات" },
            { id: "MANGA_REQUEST", label: "طلبات المانجا" },
            { id: "BROKEN_CHAPTER", label: "فصول تالفة" },
            { id: "SUGGESTION", label: "مقترحات" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? "bg-[#FF334B] text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="APPROVED">تمت الموافقة</option>
            <option value="COMPLETED">تم التنفيذ</option>
            <option value="REJECTED">مرفوض / غير متاح</option>
          </select>
        </div>
      </div>

      {/* Requests Cards List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF334B]" />
          <p className="text-xs">جاري تحميل الطلبات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 text-center space-y-2 shadow-sm">
          <Inbox className="w-10 h-10 mx-auto text-slate-400 opacity-40" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">لا توجد طلبات مطابقة</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-[#FF334B] font-bold text-sm">
                    {req.user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-950 dark:text-white">
                      {req.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      بواسطة: {req.user?.name || "مجهول"} ({req.user?.email || "بدون بريد"}) •{" "}
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold">
                    {req.type === "MANGA_REQUEST"
                      ? "طلب مانجا"
                      : req.type === "BROKEN_CHAPTER"
                      ? "فصل تالف"
                      : "اقتراح"}
                  </span>
                </div>
              </div>

              {req.details && (
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 leading-relaxed border border-slate-200/60 dark:border-zinc-750">
                  {req.details}
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={updatingId === req.id}
                    onClick={() => handleUpdateStatus(req.id, "APPROVED", "تمت الموافقة وجاري توفير العمل قريباً")}
                    className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>موافقة</span>
                  </button>

                  <button
                    disabled={updatingId === req.id}
                    onClick={() => handleUpdateStatus(req.id, "COMPLETED", "تم توفير العمل بالكامل على الموقع!")}
                    className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التنفيذ</span>
                  </button>

                  <button
                    disabled={updatingId === req.id}
                    onClick={() => handleUpdateStatus(req.id, "REJECTED", "نعتذر، العمل غير متوفر حالياً")}
                    className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض / غير متوفر</span>
                  </button>
                </div>

                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                  الحالة الحالية: <strong className="text-slate-900 dark:text-zinc-200">{req.status}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
