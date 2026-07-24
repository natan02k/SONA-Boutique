"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sona-boutique.de");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Anmeldung fehlgeschlagen.");
      }

      // Check role & redirect accordingly
      if (data.customer?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Anmeldung fehlgeschlagen.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#FAF9F6] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 border border-[#E8E5DC] bg-white p-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="label-luxury text-[10px] text-[#C5A880]">
            Maison de Haute Maroquinerie
          </span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Anmeldung</h1>
          <p className="text-xs text-[#6B6B6B]">
            Melden Sie sich für Ihren exklusiven Zugang oder die Admin-Konsole an.
          </p>
        </div>

        {errorMsg && (
          <div className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-3 text-xs text-[#B91C1C]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">E-Mail-Adresse *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@sona-boutique.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] py-2 pr-3 pl-9 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="label-luxury block text-[10px]">Passwort *</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] py-2 pr-3 pl-9 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
              </div>
            </div>
          </div>

          <LuxuryButton
            type="submit"
            disabled={loading}
            variant="gold"
            size="lg"
            className="w-full"
            shimmer
          >
            {loading ? "Anmeldung läuft..." : "Anmelden"} <ArrowRight className="ml-2 h-4 w-4" />
          </LuxuryButton>
        </form>

        {/* Demo Credentials Box for Convenience */}
        <div className="space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-4 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C5A880]">
            <ShieldCheck className="h-4 w-4" />
            <span>Test-Zugangsdaten:</span>
          </div>
          <div className="space-y-1 font-mono text-[10px] text-[#6B6B6B]">
            <p>
              <strong className="text-[#1A1A1A]">Admin:</strong> admin@sona-boutique.de / admin1234
            </p>
            <p>
              <strong className="text-[#1A1A1A]">Kunde:</strong> kunde@demo.de / demo1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
