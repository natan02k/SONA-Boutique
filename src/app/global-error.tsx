"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="de">
      <body className="bg-[#FAF9F6]">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md space-y-6 border border-[#E8E5DC] bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#B91C1C]/30 bg-[#FEF2F2]">
              <span className="font-serif text-2xl text-[#B91C1C]">!</span>
            </div>
            <h1 className="font-serif text-2xl text-[#1A1A1A]">
              Ein unerwarteter Fehler ist aufgetreten
            </h1>
            <p className="text-xs leading-relaxed text-[#6B6B6B]">
              Unser Team wurde benachrichtigt und arbeitet an einer Lösung. Bitte versuchen Sie es
              in wenigen Minuten erneut.
            </p>
            <LuxuryButton variant="gold" onClick={reset}>
              Erneut versuchen
            </LuxuryButton>
          </div>
        </div>
      </body>
    </html>
  );
}