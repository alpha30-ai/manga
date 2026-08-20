"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#18181b",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
