import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  ExternalLink,
  LogOut,
  ShieldAlert,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();

  if (!customer || customer.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="flex w-full flex-shrink-0 flex-col justify-between border-r border-[#333333] bg-[#1A1A1A] text-[#FAF9F6] lg:w-64">
        <div>
          {/* Header */}
          <div className="border-b border-[#333333] p-6">
            <span className="label-luxury block text-[9px] text-[#C5A880]">Verwaltungskonsole</span>
            <Link
              href="/admin"
              className="mt-1 block font-serif text-xl tracking-widest text-[#FAF9F6]"
            >
              SONA ADMIN
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 p-4 font-mono text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-none px-3 py-2.5 text-[#FAF9F6] transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
            >
              <LayoutDashboard className="h-4 w-4 text-[#C5A880]" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-none px-3 py-2.5 text-[#FAF9F6] transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
            >
              <Package className="h-4 w-4 text-[#C5A880]" />
              <span>Produkte</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-none px-3 py-2.5 text-[#FAF9F6] transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
            >
              <ShoppingCart className="h-4 w-4 text-[#C5A880]" />
              <span>Bestellungen</span>
            </Link>

            <Link
              href="/admin/promo-codes"
              className="flex items-center gap-3 rounded-none px-3 py-2.5 text-[#FAF9F6] transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
            >
              <Tag className="h-4 w-4 text-[#C5A880]" />
              <span>Gutscheincodes</span>
            </Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 border-t border-[#333333] p-4 font-mono text-xs">
          <div className="px-3 py-1.5 text-[10px] text-[#6B6B6B]">
            Angemeldet als: <span className="text-[#C5A880]">{customer.email}</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-[#6B6B6B] transition-colors hover:text-[#FAF9F6]"
          >
            <ExternalLink className="h-4 w-4 text-[#C5A880]" />
            <span>Zum Shop</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
    </div>
  );
}
