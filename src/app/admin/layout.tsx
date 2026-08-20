import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-zinc-950 flex flex-col md:flex-row text-right overflow-hidden transition-colors" dir="rtl">
      {/* Dynamic Collapsible Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area - Fully Fluid Responsive Layout */}
      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="w-full min-w-0 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
