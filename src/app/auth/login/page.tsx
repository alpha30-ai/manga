"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (res?.error) {
        toast.error(res.error);
        if (res.error.includes("تفعيل حسابك")) {
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
        }
      } else {
        toast.success("مرحباً بك مجدداً في ألفا مانجا!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#FF334B] border border-rose-200 dark:border-rose-900/50 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مرحباً بعودتك</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          تسجيل الدخول
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          سجّل الدخول لمتابعة قراءة فصولك المفضلة ومزامنة تقدمك
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              required
              placeholder="example@mail.com"
              dir="ltr"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all text-left shadow-inner"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              كلمة المرور
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-bold text-[#FF334B] hover:text-rose-600 dark:text-rose-400 transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full pr-10 pl-11 py-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 shadow-xl shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-center text-xs">
        <span className="text-slate-500 dark:text-zinc-400">ليس لديك حساب بعد؟ </span>
        <Link
          href="/auth/register"
          className="font-black text-[#FF334B] hover:text-rose-600 dark:text-rose-400 transition-colors"
        >
          إنشاء حساب جديد
        </Link>
      </div>
    </div>
  );
}
