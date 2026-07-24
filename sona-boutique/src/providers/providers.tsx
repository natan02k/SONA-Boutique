"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SmoothScrollProvider>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#FAF9F6",
              color: "#1A1A1A",
              border: "1px solid #E8E5DC",
              borderRadius: "0px",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12px",
              letterSpacing: "0.025em",
            },
          }}
        />
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
