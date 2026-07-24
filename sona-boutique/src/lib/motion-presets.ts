/**
 * Central motion presets for SONA Boutique.
 * Principles: Slow luxury motion (ease-out-expo), subtle offsets, non-intrusive timings.
 */

export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 0.8, ease: EASE_LUXURY },
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: EASE_LUXURY },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: EASE_LUXURY },
};

export const staggerContainer = (stagger = 0.08) => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-10%" },
  variants: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  },
});

export const staggerItem = {
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_LUXURY },
    },
  },
};
