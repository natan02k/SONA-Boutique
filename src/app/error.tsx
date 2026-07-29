"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export default function ErrorPage({
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
    <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6] p-6">
      <div className="max-w-md space-y-6 border border-[#E8E5DC] bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#C5A880]/30 bg-[#F5F4EE]">
          <span className="font-serif text-2xl text-[#C5A880]">!</span>
        </div>
        <h1 className="font-serif text-2xl text-[#1A1A1A]">Seite konnte nicht geladen werden</h1>
        <p className="text-xs leading-relaxed text-[#6B6B6B]">
          Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.
        </p>
        <LuxuryButton variant="gold" onClick={reset}>
          Seite neu laden
        </LuxuryButton>
      </div>
    </div>
  );
}