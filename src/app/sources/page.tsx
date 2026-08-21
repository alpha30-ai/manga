import { getOrSeedSources } from "@/lib/sourcesSeed";
import SourcesDirectory from "@/components/sources/SourcesDirectory";
import { Layers, Sparkles } from "lucide-react";

export default async function SourcesPage() {
  const sources = await getOrSeedSources();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-center sm:text-right space-y-2">
        <div className="inline-flex items-center gap-2 text-[#FF334B] text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>سيرفرات ومصادر المحتوى المعتمدة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          دليل المصادر والسيرفرات
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm max-w-2xl">
          يدعم موقع ألفا مانجا جلب الفصول والمانجات من كبرى المصادر العربية والعالمية بسلاسة وسرعة فائقة. يمكنك البحث والفلترة واختيار أي مصدر لتصفح مكتبته بالكامل.
        </p>
      </div>

      <SourcesDirectory initialSources={sources as any} />
    </div>
  );
}
