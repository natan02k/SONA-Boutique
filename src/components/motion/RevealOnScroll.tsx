"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE_LUXURY } from "@/lib/motion-presets";

type RevealOnScrollProps = {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "down";
  className?: string;
};

export function RevealOnScroll({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: RevealOnScrollProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 24 };
      case "down":
        return { opacity: 0, y: -24 };
      case "left":
        return { opacity: 0, x: 24 };
      case "right":
        return { opacity: 0, x: -24 };
      default:
        return { opacity: 0, y: 24 };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={getFinalPosition()}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_LUXURY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
