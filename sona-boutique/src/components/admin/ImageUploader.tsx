"use client";

import { useState } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { UploadCloud, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
};

type ImageUploaderProps = {
  productId: string;
  initialImages: ImageItem[];
  onImagesChange?: (images: ImageItem[]) => void;
};

export function ImageUploader({ productId, initialImages, onImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUrlImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Hinzufügen des Bildes");

      const updated = [...images, data.image];
      setImages(updated);
      onImagesChange?.(updated);
      setNewUrl("");
    } catch (err: any) {
      setError(err.message || "Fehler beim Hinzufügen");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updated = images.filter((img) => img.id !== imageId);
        // re-index positions
        const reindexed = updated.map((img, idx) => ({
          ...img,
          position: idx,
          isPrimary: idx === 0,
        }));
        setImages(reindexed);
        onImagesChange?.(reindexed);
      }
    } catch (err) {
      console.error("Delete image error:", err);
    }
  };

  const handleMove = async (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index]!;
    copy[index] = copy[targetIndex]!;
    copy[targetIndex] = temp;

    const reorderedIds = copy.map((img) => img.id);

    try {
      const res = await fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: reorderedIds }),
      });

      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
        onImagesChange?.(data.images);
      }
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  return (
    <div className="space-y-6 bg-white border border-[#E8E5DC] p-6">
      <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
        <div>
          <h3 className="font-serif text-lg text-[#1A1A1A]">Produktbilder Galerie</h3>
          <p className="text-[11px] text-[#6B6B6B]">
            Verwalten Sie Produktfotos. Das erste Bild wird automatisch als Hauptbild (`isPrimary`) auf der Produktkarte angezeigt.
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 text-xs">{error}</div>}

      {/* Add Image Form */}
      <form onSubmit={handleAddUrlImage} className="flex gap-2">
        <input
          type="url"
          placeholder="https://res.cloudinary.com/... oder Bild-URL eingeben"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
        />
        <LuxuryButton type="submit" disabled={loading} variant="gold" size="sm">
          <Plus className="w-4 h-4 mr-1" /> {loading ? "Lädt..." : "Bild Hinzufügen"}
        </LuxuryButton>
      </form>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={img.id} className="relative group bg-[#FAF9F6] border border-[#E8E5DC] p-2 space-y-2">
            <div className="relative aspect-square overflow-hidden bg-white border border-[#E8E5DC]">
              <img src={img.url} alt={img.altText || `Bild ${idx}`} className="w-full h-full object-cover" />
              {img.isPrimary && (
                <span className="absolute top-1.5 left-1.5 bg-[#C5A880] text-white font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 shadow-sm">
                  Hauptbild
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "UP")}
                  className="p-1 border border-[#E8E5DC] hover:bg-[#E8E5DC] disabled:opacity-30"
                  title="Nach vorne verschieben"
                >
                  <ArrowUp className="w-3 h-3 text-[#1A1A1A]" />
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, "DOWN")}
                  className="p-1 border border-[#E8E5DC] hover:bg-[#E8E5DC] disabled:opacity-30"
                  title="Nach hinten verschieben"
                >
                  <ArrowDown className="w-3 h-3 text-[#1A1A1A]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                className="p-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200"
                title="Bild löschen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
