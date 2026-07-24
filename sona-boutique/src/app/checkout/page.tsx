"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { getTaxInfo } from "@/lib/tax";
import { ShieldCheck, Truck, Lock, CreditCard, AlertCircle, ArrowLeft, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { customer, fetchMe } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",

    shippingStreet1: "",
    shippingStreet2: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "DE" as "DE" | "AT" | "CH" | "FR" | "IT" | "NL",

    sameAsShipping: true,

    billingFirstName: "",
    billingLastName: "",
    billingStreet1: "",
    billingStreet2: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "DE" as "DE" | "AT" | "CH" | "FR" | "IT" | "NL",
  });

  useEffect(() => {
    setMounted(true);
    fetchCart();
    fetchMe();
  }, [fetchCart, fetchMe]);

  // Pre-fill form if customer logged in
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        email: customer.email || prev.email,
        firstName: customer.firstName || prev.firstName,
        lastName: customer.lastName || prev.lastName,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const cartItems = mounted ? cart?.items || [] : [];
  const subtotal = cart?.subtotalCents || 0;
  const shipping = cart?.shippingCents || 0;
  const discount = cart?.discountCents || 0;
  const tax = cart?.taxCents || 0;
  const total = cart?.totalCents || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Erstellen der Bestellung.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/order/${data.order.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
        <span className="font-mono text-xs text-[#6B6B6B]">Kasse wird geladen...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6] p-6">
        <div className="max-w-md space-y-4 border border-[#E8E5DC] bg-white p-12 text-center">
          <h2 className="font-serif text-2xl text-[#1A1A1A]">Ihr Warenkorb ist leer</h2>
          <p className="text-xs text-[#6B6B6B]">
            Bitte legen Sie mindestens eine Tasche in den Warenkorb, um zur Kasse zu gehen.
          </p>
          <Link href="/catalog">
            <LuxuryButton variant="gold" size="md">
              Kollektion Entdecken
            </LuxuryButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-8 pb-24">
      <div className="container-luxury space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-6">
          <div className="space-y-1">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-[#6B6B6B] uppercase hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Warenkorb
            </Link>
            <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
              Kasse & Bezahlung
            </h1>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#C5A880]">
            <Lock className="h-4 w-4" />
            <span>256-Bit SSL Verschlüsselt</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center gap-3 border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-4 text-xs text-[#B91C1C]">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12"
        >
          {/* Left Column: Input Sections */}
          <div className="space-y-8 lg:col-span-7">
            {/* Section 1: Contact Info */}
            <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
                1. Kontaktinformationen
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="label-luxury block text-[10px]">Vorname *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-luxury block text-[10px]">Nachname *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="label-luxury block text-[10px]">E-Mail-Adresse *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                  <p className="font-mono text-[10px] text-[#6B6B6B]">
                    An diese E-Mail wird Ihre Bestellbestätigung und Versandverfolgung gesendet.
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="label-luxury block text-[10px]">Telefonnummer (optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Shipping Address */}
            <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
                2. Lieferadresse (Versicherter Expressversand)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className="label-luxury block text-[10px]">Straße & Hausnummer *</label>
                  <input
                    type="text"
                    name="shippingStreet1"
                    required
                    placeholder="Musterstraße 12"
                    value={formData.shippingStreet1}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="label-luxury block text-[10px]">Adresszusatz (optional)</label>
                  <input
                    type="text"
                    name="shippingStreet2"
                    placeholder="Appartement, Etage etc."
                    value={formData.shippingStreet2}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-luxury block text-[10px]">Postleitzahl *</label>
                  <input
                    type="text"
                    name="shippingPostalCode"
                    required
                    placeholder="10115"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-luxury block text-[10px]">Stadt *</label>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    placeholder="Berlin"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="label-luxury block text-[10px]">Land *</label>
                  <select
                    name="shippingCountry"
                    value={formData.shippingCountry}
                    onChange={handleChange}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  >
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                    <option value="CH">Schweiz</option>
                    <option value="FR">Frankreich</option>
                    <option value="IT">Italien</option>
                    <option value="NL">Niederlande</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 3: Billing Address */}
            <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
                3. Rechnungsadresse
              </h2>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#1A1A1A]">
                <input
                  type="checkbox"
                  name="sameAsShipping"
                  checked={formData.sameAsShipping}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#C5A880]"
                />
                <span>Rechnungsadresse entspricht der Lieferadresse</span>
              </label>

              {!formData.sameAsShipping && (
                <div className="grid grid-cols-1 gap-4 border-t border-[#E8E5DC] pt-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="label-luxury block text-[10px]">Straße & Hausnummer *</label>
                    <input
                      type="text"
                      name="billingStreet1"
                      required={!formData.sameAsShipping}
                      value={formData.billingStreet1}
                      onChange={handleChange}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Postleitzahl *</label>
                    <input
                      type="text"
                      name="billingPostalCode"
                      required={!formData.sameAsShipping}
                      value={formData.billingPostalCode}
                      onChange={handleChange}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Stadt *</label>
                    <input
                      type="text"
                      name="billingCity"
                      required={!formData.sameAsShipping}
                      value={formData.billingCity}
                      onChange={handleChange}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Section 4: Payment */}
            <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
                4. Zahlungsmethode
              </h2>

              <div className="space-y-2 border border-[#C5A880]/50 bg-[#FAF4EB] p-4">
                <div className="flex items-center gap-2 text-[#C5A880]">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-serif text-base text-[#1A1A1A]">
                    Simulierte Sofortzahlung (Demo-Modus)
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#6B6B6B]">
                  Ihre Bestellung wird im Demo-Modus sofort verifiziert und freigegeben. Es
                  entstehen keine realen Kosten auf Ihrem Konto.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & §312j BGB Button */}
          <div className="space-y-6 lg:col-span-5">
            <div className="sticky top-24 space-y-6 border border-[#E8E5DC] bg-white p-6">
              <h3 className="border-b border-[#E8E5DC] pb-4 font-serif text-xl text-[#1A1A1A]">
                Bestellübersicht ({cartItems.reduce((acc, it) => acc + it.quantity, 0)})
              </h3>

              {/* Items List */}
              <div className="max-h-64 space-y-3 divide-y divide-[#E8E5DC] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const primaryImage =
                    item.product.images[0]?.url ||
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop";

                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 pt-3">
                      <div className="relative h-12 w-12 flex-shrink-0 border border-[#E8E5DC] bg-[#F5F4EE]">
                        <ShimmerImage
                          src={primaryImage}
                          alt={item.product.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="label-luxury block text-[8px]">
                          {item.product.brand?.name}
                        </span>
                        <h4 className="truncate font-serif text-xs font-medium text-[#1A1A1A]">
                          {item.product.title}
                        </h4>
                        <span className="font-mono text-[10px] text-[#6B6B6B]">
                          Menge: {item.quantity}x
                        </span>
                      </div>
                      <PriceTag resalePriceCents={item.unitPriceCents * item.quantity} size="sm" />
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Summary */}
              <dl className="space-y-2 border-t border-[#E8E5DC] pt-4 text-xs">
                <div className="flex justify-between text-[#6B6B6B]">
                  <dt>Zwischensumme</dt>
                  <dd className="font-mono font-medium text-[#1A1A1A]">
                    {(subtotal / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </dd>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <dt>Rabatt ({cart?.promoCode})</dt>
                    <dd className="font-mono font-medium">
                      -
                      {(discount / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between text-[#6B6B6B]">
                  <dt>Versand (DHL Express)</dt>
                  <dd className="font-mono font-medium text-[#1A1A1A]">
                    {shipping === 0 ? "Kostenfrei" : "15,00 €"}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between border-t border-[#E8E5DC] pt-3">
                  <dt className="font-serif text-xl text-[#1A1A1A]">Gesamtsumme</dt>
                  <dd className="font-mono text-2xl font-bold text-[#1A1A1A]">
                    {(total / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </dd>
                </div>
              </dl>

              {/* PAngV / EU-OSS Legal Notice */}
              <div className="space-y-3 pt-2">
                <p className="font-mono text-[10px] text-[#6B6B6B]">
                  {formData.shippingCountry === "CH"
                    ? "MwSt. wird beim Import durch den Schweizer Zoll erhoben (0% Ausfuhr-MwSt.)."
                    : `Inkl. ${getTaxInfo(formData.shippingCountry).name} (${(tax / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })})`}
                </p>

                {/* §312j BGB Compliant Button Label */}
                <LuxuryButton
                  type="submit"
                  disabled={submitting}
                  variant="gold"
                  size="lg"
                  shimmer
                  className="w-full text-xs font-semibold tracking-wider uppercase"
                >
                  {submitting ? "Bestellung wird verarbeitet..." : "Zahlungspflichtig bestellen"}
                </LuxuryButton>

                <p className="text-center text-[9px] leading-relaxed text-[#6B6B6B]">
                  Mit Klick auf &quot;Zahlungspflichtig bestellen&quot; bestätigen Sie unsere AGB
                  und erklären sich mit der Übermittlung Ihrer Daten einverstanden.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 border-t border-[#E8E5DC] pt-4 font-mono text-[10px] text-[#6B6B6B]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>Certified Authentic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>DHL Express</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
