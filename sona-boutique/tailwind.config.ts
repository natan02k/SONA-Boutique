import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6",
        foreground: "#1A1A1A",
        muted: {
          DEFAULT: "#F5F4EE",
          foreground: "#6B6B6B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        border: "#E8E5DC",
        input: "#E8E5DC",
        ring: "#C5A880",
        primary: {
          DEFAULT: "#1A1A1A",
          foreground: "#FAF9F6",
        },
        secondary: {
          DEFAULT: "#F5F4EE",
          foreground: "#1A1A1A",
        },
        accent: {
          DEFAULT: "#C5A880",
          foreground: "#1A1A1A",
        },
        gold: {
          DEFAULT: "#C5A880",
          light: "#DFCBAB",
          dark: "#A4875E",
        },
        destructive: {
          DEFAULT: "#B91C1C",
          foreground: "#FAF9F6",
        },
        success: "#15803D",
        warning: "#B45309",
        info: "#1D4ED8",
      },
      borderRadius: {
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        DEFAULT: "0px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
