"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { X, ArrowRight } from "lucide-react";
import { EASE_LUXURY } from "@/lib/motion-presets";

type NavLink = { label: string; href: string };

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { label: "Alle Taschen", href: "/catalog" },
  ]);

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data) => {
        if (data.headerLinks) setNavLinks(data.headerLinks);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-50 bg-[#1A1A1A]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col justify-between border-r border-[#E8E5DC] bg-[#FAF9F6] p-6 shadow-2xl"
          >
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-4">
                <span className="font-serif text-lg font-light tracking-[0.2em] text-[#1A1A1A]">
                  SONA BOUTIQUE
                </span>
                <button
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-6 text-sm font-medium tracking-widest text-[#1A1A1A] uppercase">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between transition-colors hover:text-[#C5A880]"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-[#C5A880]" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer Notice */}
            <div className="space-y-4 border-t border-[#E8E5DC] pt-6 text-xs">
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block w-full bg-[#1A1A1A] py-3 text-center text-xs font-medium tracking-widest text-[#FAF9F6] uppercase"
              >
                Kundenkonto
              </Link>
              <p className="text-center font-mono text-[10px] tracking-widest text-[#6B6B6B] uppercase">
                100% Authentizitätsgarantie
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
