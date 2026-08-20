"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck, MailCheck, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    if (!email) router.push("/auth/register");
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || resendDisabled) return;
    setResendLoading(true);
    
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      toast.success("تم إعادة إرسال كود التفعيل بنجاح!");
      setCountdown(60);
      setResendDisabled(true);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إعادة الإرسال");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("تم تفعيل حسابك بنجاح! مرحباً بك في مجتمع ألفا مانجا.");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <MailCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
          تأكيد البريد الإلكتروني
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          أدخل رمز التفعيل المرسل إلى<br />
          <span className="font-bold text-[#FF334B]" dir="ltr">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 text-center">
            رمز التفعيل (6 أرقام)
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="000000"
            className="block w-full text-center tracking-[0.4em] sm:tracking-[0.5em] text-2xl sm:text-3xl font-black py-4 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 rounded-2xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF334B] transition-all shadow-inner font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-95 shadow-xl shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>تأكيد الحساب ومتابعة القراءة</span>
        </button>
      </form>

      {/* Resend Option */}
      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-center space-y-2">
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          لم يصلك رمز التفعيل بعد؟{" "}
          <button
            onClick={handleResend}
            disabled={resendDisabled || resendLoading}
            className="font-black text-[#FF334B] hover:text-rose-600 dark:text-rose-400 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
          >
            {resendLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>
              {resendDisabled ? `إعادة الإرسال بعد (${countdown}ث)` : "إعادة إرسال الرمز"}
            </span>
          </button>
        </p>

        <div>
          <Link
            href="/auth/login"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="w-3 h-3" />
            <span>العودة لصفحة تسجيل الدخول</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF334B]" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
