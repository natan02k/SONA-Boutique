"use client";

import { useState } from "react";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type GalleryImage = {
  id: string;
  url: string;
  altText?: string | null;
};

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, isHovering: false });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, isHovering: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, isHovering: false }));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsLightboxOpen(true)}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden border border-[#E8E5DC] bg-[#F5F4EE]"
      >
        <ShimmerImage
          src={currentImage!.url}
          alt={currentImage!.altText || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-cover transition-transform duration-300 ${
            zoomPos.isHovering ? "scale-150" : "scale-100"
          }`}
          style={
            zoomPos.isHovering ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined
          }
        />

        {/* Lightbox Expand Hint Icon */}
        <div className="absolute top-4 right-4 z-10 border border-[#E8E5DC] bg-white/90 p-2 text-[#1A1A1A] opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </div>
      </div>

      {/* Thumbnails */}
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-50 bg-[#1A1A1A]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-none fixed inset-4 z-50 flex items-center justify-center sm:inset-12"
            >
              <div className="pointer-events-auto relative flex h-full max-h-[85vh] w-full max-w-4xl flex-col items-center justify-center border border-[#E8E5DC] bg-[#FAF9F6] p-4">
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 z-10 border border-[#E8E5DC] bg-white p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
                  aria-label="Close Lightbox"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative h-full w-full">
                  <ShimmerImage
                    src={currentImage!.url}
                    alt={currentImage!.altText || title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
