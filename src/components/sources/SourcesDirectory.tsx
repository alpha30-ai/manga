"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Star,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";

interface SourceItem {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
  language: string;
}

export default function SourcesDirectory({ initialSources }: { initialSources: SourceItem[] }) {
  const [sources, setSources] = useState<SourceItem[]>(initialSources);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredSources = sources.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.baseUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLang =
      selectedLang === "all" ||
      (selectedLang === "ar" && (s.language.includes("عرب") || s.language === "ar")) ||
      (selectedLang === "en" && (s.language.includes("إنجليز") || s.language === "en"));

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && s.isActive) ||
      (selectedStatus === "inactive" && !s.isActive);

    return matchesQuery && matchesLang && matchesStatus;
  });

  return (
    <div className="space-y-8" dir="rtl">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم المصدر أو الرابط..."
              className="w-full pl-4 pr-11 py-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF334B] outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-4" />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "جميع اللغات" },
              { id: "ar", label: "العربية" },
              { id: "en", label: "الإنجليزية" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLang(tab.id)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedLang === tab.id
                    ? "bg-gradient-to-l from-[#FF334B] to-rose-600 text-white shadow-lg shadow-rose-500/25"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="group flex flex-col justify-between bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 hover:border-[#FF334B]/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF334B] to-rose-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg flex items-center gap-1 border border-amber-200/50 dark:border-amber-900/50">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.9
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      source.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                    }`}
                  >
                    {source.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{source.isActive ? "نشط" : "معطل"}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF334B] dark:group-hover:text-[#FF334B] transition-colors">
                  {source.name}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-1 font-mono" dir="ltr">
                  {source.baseUrl}
                </p>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                سيرفر معتمد وموثوق لجلب فصول المانجا والمانهوا وتحديثاتها اليومية بأعلى جودة.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between mt-4">
              <span className="text-xs font-semibold text-slate-500">
                اللغة: <strong className="text-slate-700 dark:text-zinc-300">{source.language || "العربية"}</strong>
              </span>

              <Link
                href={`/sources/${source.id}`}
                className="px-4 py-2 bg-gradient-to-l from-[#FF334B] to-rose-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <span>تصفح الأعمال</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <Layers className="w-10 h-10 mx-auto opacity-50 text-[#FF334B]" />
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">لم يتم العثور على أي مصادر</h3>
            <p className="text-xs text-slate-500">جرب تغيير كلمات البحث أو تغيير فلتر اللغة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
