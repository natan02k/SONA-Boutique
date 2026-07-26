"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ArrowLeft, Save, CheckCircle2, ArrowRight, ImageIcon } from "lucide-react";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };
type ImageItem = { id: string; url: string; altText?: string | null; position: number; isPrimary: boolean };

export default function AdminNewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // After product is created we switch to step 2
  const [step, setStep] = useState<1 | 2>(1);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    brandId: "",
    categoryId: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    sku: "",

    material: "",
    color: "",
    hardware: "",
    originCountry: "FR",
    manufacturingYear: new Date().getFullYear(),
    condition: "VERY_GOOD" as "PRISTINE" | "EXCELLENT" | "VERY_GOOD" | "GOOD",
    conditionNotes: "",
    authenticityCertNo: "",
    certificateUrl: "",

    includesOriginalBox: false,
    includesDustBag: false,
    includesReceipt: false,
    includesAuthenticityCard: false,

    resalePriceEuro: "",
    compareAtPriceEuro: "",
    retailPriceEuro: "",
    inventoryQuantity: 1,

    weightGrams: 800,
    dimensions: "",
    tags: "",
    isFeatured: false,
    featuredRank: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, cRes] = await Promise.all([fetch("/api/brands"), fetch("/api/categories")]);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBrands(bData.brands || []);
          if (bData.brands?.length > 0) {
            setFormData((prev) => ({ ...prev, brandId: bData.brands[0].id }));
          }
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(cData.categories || []);
        }
      } catch (err) {
        console.error("Fehler beim Laden von Marken & Kategorien", err);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Step 1: Create the product, then move to step 2
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.brandId || !formData.resalePriceEuro) {
      setErrorMsg("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        ...formData,
        resalePriceCents: Math.round(parseFloat(formData.resalePriceEuro) * 100),
        compareAtPriceCents: formData.compareAtPriceEuro
          ? Math.round(parseFloat(formData.compareAtPriceEuro) * 100)
          : null,
        retailPriceCents: formData.retailPriceEuro
          ? Math.round(parseFloat(formData.retailPriceEuro) * 100)
          : null,
        imageUrls: [],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Produkts.");
      }

      // Move to step 2: image upload
      setCreatedProductId(data.product.id);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Ein Unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6B6B6B] uppercase hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück zu allen Produkten
          </Link>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">
            {step === 1 ? "Neues Produkt Anlegen" : `Bilder hochladen — ${formData.title}`}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="hidden items-center gap-2 sm:flex">
          <div className={`flex items-center gap-2 font-mono text-[10px] uppercase ${step === 1 ? "text-[#C5A880]" : "text-[#6B6B6B]"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border font-bold text-[11px] ${step === 1 ? "border-[#C5A880] bg-[#C5A880] text-white" : "border-[#C5A880] text-[#C5A880]"}`}>
              {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </span>
            Produktdaten
          </div>
          <ArrowRight className="h-3 w-3 text-[#D4CFC4]" />
          <div className={`flex items-center gap-2 font-mono text-[10px] uppercase ${step === 2 ? "text-[#C5A880]" : "text-[#9A9080]"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border font-bold text-[11px] ${step === 2 ? "border-[#C5A880] bg-[#C5A880] text-white" : "border-[#D4CFC4] text-[#9A9080]"}`}>
              2
            </span>
            Fotos hochladen
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-4 text-xs text-[#B91C1C]">
          {errorMsg}
        </div>
      )}

      {/* ─── STEP 1: Product Details Form ─── */}
      {step === 1 && (
        <form onSubmit={handleSubmitStep1} className="space-y-8">
          {/* Section 1: Stammdaten */}
          <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
              1. Produktstammdaten
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="label-luxury block text-[10px]">Titel *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="z.B. Hermès Birkin 30 Togo Gold"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="label-luxury block text-[10px]">Untertitel / Zustandshinweis</label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="Exemplarischer Zustand mit Ursprungsverpackung"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Marke *</label>
                <select
                  name="brandId"
                  required
                  value={formData.brandId}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Kategorie</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="">Keine Kategorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="DRAFT">DRAFT (Entwurf — nicht öffentlich)</option>
                  <option value="PUBLISHED">PUBLISHED (Aktiv im Katalog)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">SKU (Optional)</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="HERMES-BIRKIN-30-GOLD"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="label-luxury block text-[10px]">Beschreibung *</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] p-3 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Luxus-Spezifikationen */}
          <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
              2. Luxus-Spezifikationen
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Material</label>
                <input type="text" name="material" placeholder="Togo Kuhleder" value={formData.material} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Farbe</label>
                <input type="text" name="color" placeholder="Gold / Braun" value={formData.color} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Hardware</label>
                <input type="text" name="hardware" placeholder="Gold Plated" value={formData.hardware} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Baujahr</label>
                <input type="number" name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Zustand *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none">
                  <option value="PRISTINE">PRISTINE (Neuwertig)</option>
                  <option value="EXCELLENT">EXCELLENT (Hervorragend)</option>
                  <option value="VERY_GOOD">VERY_GOOD (Sehr gut)</option>
                  <option value="GOOD">GOOD (Gut)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Zertifikat-Nr.</label>
                <input type="text" name="authenticityCertNo" placeholder="LX-2026-0001" value={formData.authenticityCertNo} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="label-luxury block text-[10px]">Prüfzertifikat (PDF-URL vom Dienstleister)</label>
                <input type="url" name="certificateUrl" placeholder="https://cdn.dienstleister.de/zertifikate/lx-2026-0001.pdf" value={formData.certificateUrl} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
                <p className="font-mono text-[9px] text-[#6B6B6B]">Link zum Prüfzertifikat des externen Authentifizierungsdienstleisters (z. B. PDF-URL)</p>
              </div>
            </div>
          </section>

          {/* Section 3: Beigaben */}
          <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">3. Beigaben &amp; Zubehör</h3>
            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
              {[
                { name: "includesOriginalBox", label: "Originalkarton" },
                { name: "includesDustBag", label: "Staubbeutel" },
                { name: "includesReceipt", label: "Kaufbeleg" },
                { name: "includesAuthenticityCard", label: "Echtheitskarte" },
              ].map((item) => (
                <label key={item.name} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={formData[item.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="accent-[#C5A880]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Section 4: Preisauszeichnung */}
          <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">4. Preisauszeichnung &amp; Lagerbestand</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Verkaufspreis (€) *</label>
                <input type="number" name="resalePriceEuro" step="0.01" required placeholder="22500.00" value={formData.resalePriceEuro} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Streichpreis (€)</label>
                <input type="number" name="compareAtPriceEuro" step="0.01" placeholder="25000.00" value={formData.compareAtPriceEuro} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Lagerbestand *</label>
                <input type="number" name="inventoryQuantity" required min={0} value={formData.inventoryQuantity} onChange={handleChange} className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none" />
              </div>
            </div>
          </section>

          {/* Submit Step 1 */}
          <div className="flex justify-end pt-2">
            <LuxuryButton type="submit" disabled={submitting} variant="gold" size="lg" shimmer>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Wird angelegt..." : "Weiter: Fotos hochladen →"}
            </LuxuryButton>
          </div>
        </form>
      )}

      {/* ─── STEP 2: Image Upload ─── */}
      {step === 2 && createdProductId && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-mono text-[11px] font-semibold text-emerald-800">
                „{formData.title}" wurde erfolgreich angelegt!
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-emerald-700">
                Laden Sie jetzt Produktfotos per Drag &amp; Drop hoch. Sie können diesen Schritt auch überspringen.
              </p>
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            productId={createdProductId}
            initialImages={productImages}
            onImagesChange={(imgs) => setProductImages(imgs)}
          />

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-[#E8E5DC] pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="font-mono text-[10px] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] underline underline-offset-2"
            >
              Überspringen → Zurück zur Produktliste
            </button>
            <LuxuryButton
              onClick={() => router.push(`/admin/products/${createdProductId}`)}
              variant="gold"
              size="lg"
              shimmer
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Fertig — Produkt bearbeiten
            </LuxuryButton>
          </div>
        </div>
      )}
    </div>
  );
}
