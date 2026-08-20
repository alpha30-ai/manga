import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// In-memory cache for site settings to prevent concurrent DB connection spam
let cachedSettings: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function GET() {
  try {
    const now = Date.now();
    if (cachedSettings && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedSettings);
    }

    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          siteName: "ألفا مانجا",
          siteDescription: "أفضل منصة عربية احترافية لقراءة المانجا والمانهوا الكورية بأعلى جودة",
          headerSubtitle: "بوابة القراءة الاحترافية",
          footerText: "المنصة العربية الأولى للمانجا والمانهوا",
          developerCredit: "</> Developed by Mohamed Hashish",
          themeColor: "indigo",
          isMaintenanceMode: false,
          maintenanceMessage: "الموقع تحت أعمال الصيانة والتطوير الدوري لتحديث الفصول وتحسين الأداء. سنعود للعمل بكامل طاقتنا قريباً.",
          showSiteName: true,
          showHeaderSubtitle: true,
          showFooterText: true,
        },
      });
    }

    cachedSettings = settings;
    lastCacheTime = now;

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Site settings GET error:", error);
    if (cachedSettings) {
      return NextResponse.json(cachedSettings);
    }
    return NextResponse.json({ message: "فشل جلب إعدادات الموقع" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteName,
      siteDescription,
      logoUrl,
      faviconUrl,
      webAppIconUrl,
      headerSubtitle,
      footerText,
      developerCredit,
      announcement,
      themeColor,
      isMaintenanceMode,
      maintenanceMessage,
      showSiteName,
      showHeaderSubtitle,
      showFooterText,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        siteName: siteName || "ألفا مانجا",
        siteDescription: siteDescription || "",
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        webAppIconUrl: webAppIconUrl || null,
        headerSubtitle: headerSubtitle || "بوابة القراءة الاحترافية",
        footerText: footerText || "المنصة العربية الأولى للمانجا والمانهوا",
        developerCredit: developerCredit || "</> Developed by Mohamed Hashish",
        announcement: announcement || null,
        themeColor: themeColor || "indigo",
        isMaintenanceMode: typeof isMaintenanceMode === "boolean" ? isMaintenanceMode : false,
        maintenanceMessage: maintenanceMessage || "الموقع تحت أعمال الصيانة والتطوير الدوري.",
        showSiteName: typeof showSiteName === "boolean" ? showSiteName : true,
        showHeaderSubtitle: typeof showHeaderSubtitle === "boolean" ? showHeaderSubtitle : true,
        showFooterText: typeof showFooterText === "boolean" ? showFooterText : true,
      },
      create: {
        id: "default",
        siteName: siteName || "ألفا مانجا",
        siteDescription: siteDescription || "",
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        webAppIconUrl: webAppIconUrl || null,
        headerSubtitle: headerSubtitle || "بوابة القراءة الاحترافية",
        footerText: footerText || "المنصة العربية الأولى للمانجا والمانهوا",
        developerCredit: developerCredit || "</> Developed by Mohamed Hashish",
        announcement: announcement || null,
        themeColor: themeColor || "indigo",
        isMaintenanceMode: typeof isMaintenanceMode === "boolean" ? isMaintenanceMode : false,
        maintenanceMessage: maintenanceMessage || "الموقع تحت أعمال الصيانة والتطوير الدوري.",
        showSiteName: typeof showSiteName === "boolean" ? showSiteName : true,
        showHeaderSubtitle: typeof showHeaderSubtitle === "boolean" ? showHeaderSubtitle : true,
        showFooterText: typeof showFooterText === "boolean" ? showFooterText : true,
      },
    });

    // Invalidate and update cache
    cachedSettings = updated;
    lastCacheTime = Date.now();

    return NextResponse.json({
      message: "تم حفظ كافة إعدادات الموقع وتفضيلات العرض بنجاح!",
      settings: updated,
    });
  } catch (error) {
    console.error("Site settings POST error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء حفظ الإعدادات" }, { status: 500 });
  }
}
