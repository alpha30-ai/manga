"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  User as UserIcon,
  Trash2,
  ShieldAlert,
  Loader2,
  UserCog,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface UsersTableProps {
  users: UserItem[];
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`هل أنت متأكد من تغيير صلاحية المستخدم إلى ${newRole === "ADMIN" ? "مدير" : "مستخدم"}؟`)) return;

    try {
      setLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`تم تغيير الصلاحية إلى ${newRole === "ADMIN" ? "مدير" : "مستخدم"}`);
      } else {
        toast.error("فشل تغيير الصلاحية");
      }
    } catch (e) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الحساب بالكامل؟ سيتم مسح بياناته نهائياً.")) return;

    try {
      setLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("تم حذف المستخدم بنجاح");
      } else {
        toast.error("فشل حذف المستخدم");
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#FF334B]" />
            <span>إدارة المستخدمين والأعضاء</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            التحكم في صلاحيات الحسابات وحظر أو حذف المستخدمين ({users.length})
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF334B] outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 font-bold">
              <tr>
                <th className="p-4 sm:p-5">المستخدم</th>
                <th className="p-4 sm:p-5">البريد الإلكتروني</th>
                <th className="p-4 sm:p-5">الصلاحية الحالية</th>
                <th className="p-4 sm:p-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF334B] to-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span>{u.name || "بدون اسم"}</span>
                    </div>
                  </td>

                  <td className="p-4 sm:p-5 text-slate-600 dark:text-zinc-400 font-mono text-xs" dir="ltr">
                    {u.email}
                  </td>

                  <td className="p-4 sm:p-5">
                    {u.role === "ADMIN" ? (
                      <span className="px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        مدير
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        مستخدم
                      </span>
                    )}
                  </td>

                  <td className="p-4 sm:p-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleChange(u.id, u.role)}
                        disabled={loadingId === u.id}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        title="تغيير الصلاحية"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        <span>{u.role === "ADMIN" ? "تنزيل لمستخدم" : "ترقية لمدير"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={loadingId === u.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                        title="حذف الحساب"
                      >
                        {loadingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    لم يتم العثور على أي مستخدمين مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
