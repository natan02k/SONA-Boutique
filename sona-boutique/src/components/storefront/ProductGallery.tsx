"use client";

import { useState } from "react";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";

type GalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
};

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages =
    images.length > 0
      ? images
      : [
          {
            id: "fallback-1",
            url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
            altText: title,
          },
        ];

  const currentImage = galleryImages[selectedIndex] || galleryImages[0];

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative aspect-square w-full overflow-hidden border border-[#E8E5DC] bg-[#F5F4EE]">
        <ShimmerImage
          src={currentImage!.url}
          alt={currentImage!.altText || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails Grid */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-square overflow-hidden border transition-all ${
                selectedIndex === idx
                  ? "border-[#C5A880] ring-1 ring-[#C5A880]"
                  : "border-[#E8E5DC] opacity-70 hover:opacity-100"
              }`}
            >
              <ShimmerImage
                src={img.url}
                alt={img.altText || `${title} Bild ${idx + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
