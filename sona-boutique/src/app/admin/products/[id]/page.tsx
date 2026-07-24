"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

type Brand = { id: string; name: string };
type Category = { id: string; name: string };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminEditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    manufacturingYear: 2023,
    condition: "VERY_GOOD" as "PRISTINE" | "EXCELLENT" | "VERY_GOOD" | "GOOD",
    conditionNotes: "",
    authenticityCertNo: "",

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

    imageUrls: [] as string[],
  });

  useEffect(() => {
    async function loadProductAndOptions() {
      try {
        setLoading(true);
        const [bRes, cRes, pRes] = await Promise.all([
          fetch("/api/brands"),
          fetch("/api/categories"),
          fetch(`/api/admin/products?limit=100`),
        ]);

        if (bRes.ok) {
          const bData = await bRes.json();
          setBrands(bData.brands || []);
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(cData.categories || []);
        }

        if (pRes.ok) {
          const pData = await pRes.json();
          const target = pData.products?.find((p: any) => p.id === id);

          if (target) {
            setFormData({
              title: target.title || "",
              subtitle: target.subtitle || "",
              description: target.description || "",
              brandId: target.brandId || "",
              categoryId: target.categoryId || "",
              status: target.status || "DRAFT",
              sku: target.sku || "",
              material: target.material || "",
              color: target.color || "",
              hardware: target.hardware || "",
              originCountry: target.originCountry || "FR",
              manufacturingYear: target.manufacturingYear || 2023,
              condition: target.condition || "VERY_GOOD",
              conditionNotes: target.conditionNotes || "",
              authenticityCertNo: target.authenticityCertNo || "",

              includesOriginalBox: !!target.includesOriginalBox,
              includesDustBag: !!target.includesDustBag,
              includesReceipt: !!target.includesReceipt,
              includesAuthenticityCard: !!target.includesAuthenticityCard,

              resalePriceEuro: (target.resalePriceCents / 100).toString(),
              compareAtPriceEuro: target.compareAtPriceCents
                ? (target.compareAtPriceCents / 100).toString()
                : "",
              retailPriceEuro: target.retailPriceCents
                ? (target.retailPriceCents / 100).toString()
                : "",
              inventoryQuantity: target.inventoryQuantity ?? 1,

              weightGrams: target.weightGrams || 800,
              dimensions: target.dimensions || "",
              tags: target.tags || "",
              isFeatured: !!target.isFeatured,
              featuredRank: target.featuredRank || 0,

              imageUrls: target.images?.map((img: any) => img.url) || [],
            });
          }
        }
      } catch (err) {
        console.error("Fehler beim Laden des Produkts", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductAndOptions();
  }, [id]);

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

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...formData.imageUrls];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, imageUrls: updated }));
  };

  const addImageUrl = () => {
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        imageUrls: formData.imageUrls.filter((url) => url.trim().length > 0),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Aktualisieren des Produkts.");
      }

      router.push("/admin/products");
    } catch (err: any) {
      setErrorMsg(err.message || "Ein Unerwarteter Fehler ist aufgetreten.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#6B6B6B]">
        Produkt Daten werden geladen...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6B6B6B] uppercase hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück zu allen Produkten
          </Link>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">
            Produkt Bearbeiten: {formData.title}
          </h1>
        </div>
      </div>

      {errorMsg && (
        <div className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-4 text-xs text-[#B91C1C]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="label-luxury block text-[10px]">Untertitel</label>
              <input
                type="text"
                name="subtitle"
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
                <option value="DRAFT">DRAFT (Entwurf)</option>
                <option value="PUBLISHED">PUBLISHED (Aktiv im Shop)</option>
                <option value="ARCHIVED">ARCHIVED (Archiviert)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">SKU</label>
              <input
                type="text"
                name="sku"
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
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Farbe</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Hardware</label>
              <input
                type="text"
                name="hardware"
                value={formData.hardware}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Baujahr</label>
              <input
                type="number"
                name="manufacturingYear"
                value={formData.manufacturingYear}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Zustand *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              >
                <option value="PRISTINE">PRISTINE (Neuwertig)</option>
                <option value="EXCELLENT">EXCELLENT (Hervorragend)</option>
                <option value="VERY_GOOD">VERY_GOOD (Sehr gut)</option>
                <option value="GOOD">GOOD (Gut)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Zertifikat-Nr.</label>
              <input
                type="text"
                name="authenticityCertNo"
                value={formData.authenticityCertNo}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Preisauszeichnung */}
        <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
          <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
            3. Preisauszeichnung & Lagerbestand
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Verkaufspreis (€) *</label>
              <input
                type="number"
                name="resalePriceEuro"
                step="0.01"
                required
                value={formData.resalePriceEuro}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Streichpreis (€)</label>
              <input
                type="number"
                name="compareAtPriceEuro"
                step="0.01"
                value={formData.compareAtPriceEuro}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Lagerbestand *</label>
              <input
                type="number"
                name="inventoryQuantity"
                required
                min={0}
                value={formData.inventoryQuantity}
                onChange={handleChange}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Bilder URLs */}
        <section className="space-y-4 border border-[#E8E5DC] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
            <h3 className="font-serif text-lg text-[#1A1A1A]">4. Produktbilder (URLs)</h3>
            <button
              type="button"
              onClick={addImageUrl}
              className="flex items-center gap-1 font-mono text-[10px] text-[#C5A880] uppercase hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Bild hinzufügen
            </button>
          </div>

          <div className="space-y-3">
            {formData.imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                  className="flex-1 border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
                {formData.imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(idx)}
                    className="p-2 text-[#6B6B6B] hover:text-[#B91C1C]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <LuxuryButton type="submit" disabled={submitting} variant="gold" size="lg" shimmer>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Wird gespeichert..." : "Änderungen Speichern"}
          </LuxuryButton>
        </div>
      </form>
    </div>
  );
}
