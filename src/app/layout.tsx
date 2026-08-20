import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import DatabaseHeartbeat from "@/components/layout/DatabaseHeartbeat";
import MaintenanceView from "@/components/layout/MaintenanceView";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return {
      title: `${settings?.siteName || "ألفا مانجا"} | قراءة أحدث فصول المانجا والمانهوا`,
      description: settings?.siteDescription || "أفضل منصة عربية احترافية لقراءة المانجا والمانهوا الكورية بأعلى جودة",
    };
  } catch (e) {
    return {
      title: "ألفا مانجا | قراءة أحدث فصول المانجا والمانهوا",
      description: "أفضل منصة عربية احترافية لقراءة المانجا والمانهوا الكورية",
    };
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  let isMaintenance = false;
  let maintenanceMsg = "";
  let siteName = "ألفا مانجا";

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (settings) {
      siteName = settings.siteName;
      if (settings.isMaintenanceMode && (session?.user as any)?.role !== "ADMIN") {
        isMaintenance = true;
        maintenanceMsg = settings.maintenanceMessage;
      }
    }
  } catch (e) {}

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col site-grid-bg`}
      >
        <Providers>
          <DatabaseHeartbeat />
          {isMaintenance ? (
            <MaintenanceView message={maintenanceMsg} siteName={siteName} />
          ) : (
            <>
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <BottomNav />
              <Footer />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
