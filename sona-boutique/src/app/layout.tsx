import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import { TopNoticeBar } from "@/components/storefront/TopNoticeBar";
import { Header } from "@/components/storefront/Header";
import { MobileMenu } from "@/components/storefront/MobileMenu";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { SearchModal } from "@/components/storefront/SearchModal";
import { Footer } from "@/components/storefront/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SONA Boutique — Pre-Owned Luxury Handbags",
    template: "%s | SONA Boutique",
  },
  description:
    "Zertifizierte gebrauchte Luxushandtaschen von Chanel, Hermès, Louis Vuitton & mehr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground selection:bg-accent selection:text-primary-foreground flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <TopNoticeBar />
          <Header />
          <MobileMenu />
          <CartDrawer />
          <SearchModal />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
