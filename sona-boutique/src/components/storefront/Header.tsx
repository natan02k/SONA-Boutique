"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { EASE_LUXURY } from "@/lib/motion-presets";

type NavLink = { label: string; href: string };

export function Header() {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const { toggleCartDrawer, toggleMobileMenu, openSearch } = useUIStore();
  const { cart, fetchCart } = useCartStore();
  const { customer, fetchMe } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { label: "Alle Taschen", href: "/catalog" },
  ]);

  useEffect(() => {
    setMounted(true);
    fetchMe();
    fetchCart();
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data) => {
        if (data.headerLinks) setNavLinks(data.headerLinks);
      })
      .catch(() => {});
  }, [fetchMe, fetchCart]);

  const totalCartCount = mounted
    ? cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
    : 0;

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        y: scrollDirection === "down" && !isAtTop ? "-100%" : "0%",
      }}
      transition={{ duration: 0.35, ease: EASE_LUXURY }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isAtTop
          ? "border-b border-transparent bg-[#FAF9F6]"
          : "border-b border-[#E8E5DC] bg-[#FAF9F6]/90 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="container-luxury flex h-16 items-center justify-between lg:h-20">
        {/* Left: Mobile Menu Button & Navigation Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleMobileMenu}
            aria-label="Open menu"
            className="p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-8 text-xs font-medium tracking-widest text-[#6B6B6B] uppercase lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#1A1A1A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <Link href="/" className="group text-center">
          <span className="font-serif text-xl font-light tracking-[0.2em] text-[#1A1A1A] transition-colors group-hover:text-[#C5A880] sm:text-2xl lg:text-3xl">
            SONA BOUTIQUE
          </span>
        </Link>

        {/* Right: Actions (Search, Account, Cart) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Search Trigger */}
          <button
            onClick={openSearch}
            aria-label="Search products"
            className="flex items-center gap-2 p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
          >
            <Search className="h-5 w-5" />
            <span className="hidden border border-[#E8E5DC] px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-[#6B6B6B] sm:inline">
              ⌘K
            </span>
          </button>

          {/* Account */}
          <Link
            href={customer ? "/account" : "/login"}
            aria-label="Account"
            className="p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart Icon & Live Badge */}
          <button
            onClick={toggleCartDrawer}
            aria-label="Shopping bag"
            className="relative p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalCartCount}
                transition={{ duration: 0.3, ease: EASE_LUXURY }}
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5A880] font-mono text-[9px] font-bold text-[#1A1A1A] select-none"
              >
                {totalCartCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
