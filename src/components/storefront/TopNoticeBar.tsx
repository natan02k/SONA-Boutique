"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function TopNoticeBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notices, setNotices] = useState<string[]>([
    "✦ Laden… ✦",
  ]);

  useEffect(() => {
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data) => {
        if (data.notices?.length > 0) setNotices(data.notices);
      })
      .catch(() => {
        // Fallback not needed — default works
      });
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [notices.length]);

  return (
    <div className="overflow-hidden border-b border-[#C5A880]/30 bg-[#1A1A1A] px-4 py-2.5 text-center text-[#FAF9F6]">
      <div className="relative flex h-4 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute font-mono text-[10px] tracking-[0.2em] text-[#FAF9F6] uppercase"
          >
            {notices[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
