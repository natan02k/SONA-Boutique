"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import {
  UploadCloud,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Loader2,
  ImageIcon,
} from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
};

type UploadingFile = {
  id: string;
  file: File;
  preview: string;
  progress: number; // 0–100
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
};

type ImageUploaderProps = {
  productId: string;
  initialImages: ImageItem[];
  onImagesChange?: (images: ImageItem[]) => void;
};

export function ImageUploader({ productId, initialImages, onImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when parent re-fetches images (e.g. after edit page load)
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  /* ─────────────────────────────────────────────
   * Fetch Cloudinary signed upload parameters
   * ──────────────────────────────────────────── */
  async function getUploadSignature(folder: string) {
    const res = await fetch(`/api/admin/upload-signature?folder=${encodeURIComponent(folder)}`);
    if (!res.ok) throw new Error("Signatur konnte nicht abgerufen werden.");
    return res.json() as Promise<{
      timestamp: number;
      signature: string;
      apiKey: string;
      cloudName: string;
      folder: string;
    }>;
  }

  /* ─────────────────────────────────────────────
   * Upload a single file to Cloudinary, then save URL in DB
   * ──────────────────────────────────────────── */
  async function uploadFile(uploadItem: UploadingFile) {
    const folder = `sona-boutique/products/${productId}`;

    // Mark as uploading
    setUploading((prev) =>
      prev.map((u) => (u.id === uploadItem.id ? { ...u, status: "uploading", progress: 5 } : u))
    );

    try {
      // 1. Get signed params from our server
      const sig = await getUploadSignature(folder);

      // 2. Build FormData for Cloudinary
      const fd = new FormData();
      fd.append("file", uploadItem.file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", sig.timestamp.toString());
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);

      // 3. Upload directly to Cloudinary via fetch
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

      // Simulate progress until we get a response
      const progressInterval = setInterval(() => {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === uploadItem.id && u.progress < 85
              ? { ...u, progress: u.progress + 5 }
              : u,
          ),
        );
      }, 300);

      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: fd,
      });

      clearInterval(progressInterval);

      if (!cloudRes.ok) {
        const errBody = await cloudRes.json().catch(() => ({}));
        const msg =
          (errBody as any)?.error?.message ||
          `Cloudinary Fehler ${cloudRes.status}: Bitte prüfen Sie Ihre API-Zugangsdaten in der .env Datei.`;
        throw new Error(msg);
      }

      const cloudData = await cloudRes.json();
      const imageUrl: string = cloudData.secure_url;

      // 4. Save URL in our DB
      setUploading((prev) =>
        prev.map((u) => (u.id === uploadItem.id ? { ...u, progress: 95 } : u))
      );

      const dbRes = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl, altText: uploadItem.file.name.replace(/\.[^.]+$/, "") }),
      });

      if (!dbRes.ok) throw new Error("Bild konnte nicht in der Datenbank gespeichert werden.");
      const dbData = await dbRes.json();

      // 5. Add to gallery state
      setImages((prev) => {
        const updated = [...prev, dbData.image];
        onImagesChange?.(updated);
        return updated;
      });

      setUploading((prev) =>
        prev.map((u) => (u.id === uploadItem.id ? { ...u, status: "done", progress: 100 } : u))
      );

      // Remove from uploading queue after 2s
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== uploadItem.id));
      }, 2000);
    } catch (err: any) {
      setUploading((prev) =>
        prev.map((u) =>
          u.id === uploadItem.id
            ? { ...u, status: "error", errorMsg: err.message || "Upload fehlgeschlagen" }
            : u
        )
      );
    }
  }

  /* ─────────────────────────────────────────────
   * Handle file selection (input or drop)
   * ──────────────────────────────────────────── */
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
      const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

      Array.from(files).forEach((file) => {
        const uid = `${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);

        // Validate
        if (!ALLOWED.includes(file.type)) {
          const item: UploadingFile = {
            id: uid,
            file,
            preview,
            progress: 0,
            status: "error",
            errorMsg: "Nur JPG, PNG oder WebP erlaubt.",
          };
          setUploading((prev) => [...prev, item]);
          return;
        }

        if (file.size > MAX_SIZE) {
          const item: UploadingFile = {
            id: uid,
            file,
            preview,
            progress: 0,
            status: "error",
            errorMsg: "Datei zu groß (max. 10 MB).",
          };
          setUploading((prev) => [...prev, item]);
          return;
        }

        const item: UploadingFile = { id: uid, file, preview, progress: 0, status: "pending" };
        setUploading((prev) => [...prev, item]);
        uploadFile(item);
      });
    },
    [productId]
  );

  /* ─────────────────────────────────────────────
   * Delete image
   * ──────────────────────────────────────────── */
  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setImages((prev) => {
        const updated = prev
          .filter((img) => img.id !== imageId)
          .map((img, idx) => ({ ...img, position: idx, isPrimary: idx === 0 }));
        onImagesChange?.(updated);
        return updated;
      });
    }
  }

  /* ─────────────────────────────────────────────
   * Move image up/down
   * ──────────────────────────────────────────── */
  async function handleMove(index: number, dir: "UP" | "DOWN") {
    const target = dir === "UP" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;

    const copy = [...images];
    const tmp = copy[index]!;
    copy[index] = copy[target]!;
    copy[target] = tmp;

    const reorderedIds = copy.map((img) => img.id);
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
  }

  /* ─────────────────────────────────────────────
   * Drag & Drop handlers
   * ──────────────────────────────────────────── */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  /* ─────────────────────────────────────────────
   * Render
   * ──────────────────────────────────────────── */
  return (
    <section className="space-y-6 border border-[#E8E5DC] bg-white p-6">
      {/* Header */}
      <div className="border-b border-[#E8E5DC] pb-3">
        <h3 className="font-serif text-lg text-[#1A1A1A]">4. Produktbilder Galerie</h3>
        <p className="mt-0.5 font-mono text-[10px] text-[#6B6B6B]">
          JPG · PNG · WebP · max. 10 MB pro Bild · Das erste Bild ist das Hauptbild
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed py-10 transition-all duration-200 ${
          isDragOver
            ? "border-[#C5A880] bg-[#C5A880]/5 scale-[1.01]"
            : "border-[#D4CFC4] bg-[#FAF9F6] hover:border-[#C5A880] hover:bg-[#C5A880]/5"
        }`}
      >
        <div
          className={`rounded-full p-3 transition-colors ${isDragOver ? "bg-[#C5A880]/20" : "bg-[#E8E5DC] group-hover:bg-[#C5A880]/20"}`}
        >
          <UploadCloud
            className={`h-6 w-6 transition-colors ${isDragOver ? "text-[#C5A880]" : "text-[#8A8070] group-hover:text-[#C5A880]"}`}
          />
        </div>
        <div className="text-center">
          <p className="font-serif text-sm text-[#1A1A1A]">
            Bilder hierher ziehen oder{" "}
            <span className="text-[#C5A880] underline underline-offset-2">auswählen</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-[#9A9080]">
            Mehrere Dateien gleichzeitig möglich
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload Progress Queue */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 border border-[#E8E5DC] bg-[#FAF9F6] p-3"
            >
              {/* Preview Thumb */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden border border-[#E8E5DC] bg-white">
                <img src={u.preview} alt="" className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate font-mono text-[10px] text-[#1A1A1A]">{u.file.name}</p>

                {/* Progress Bar */}
                {(u.status === "uploading" || u.status === "pending") && (
                  <div className="relative h-1 w-full overflow-hidden bg-[#E8E5DC]">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#C5A880] transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}

                {u.status === "error" && (
                  <p className="font-mono text-[9px] text-red-600">{u.errorMsg}</p>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {(u.status === "pending" || u.status === "uploading") && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#C5A880]" />
                )}
                {u.status === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                {u.status === "error" && (
                  <XCircle
                    className="h-4 w-4 cursor-pointer text-red-500"
                    onClick={() => setUploading((prev) => prev.filter((p) => p.id !== u.id))}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Images Gallery */}
      {images.length === 0 && uploading.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-[#9A9080]">
          <ImageIcon className="h-8 w-8 opacity-30" />
          <p className="font-mono text-[10px]">Noch keine Bilder hochgeladen</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group/card relative flex flex-col gap-2 border border-[#E8E5DC] bg-[#FAF9F6] p-2"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden border border-[#E8E5DC] bg-white">
                <img
                  src={img.url}
                  alt={img.altText || `Bild ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                {img.isPrimary && (
                  <span className="absolute top-1.5 left-1.5 bg-[#C5A880] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white shadow">
                    Hauptbild
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "UP")}
                    title="Nach vorne"
                    className="border border-[#E8E5DC] p-1 hover:bg-[#E8E5DC] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3 text-[#1A1A1A]" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, "DOWN")}
                    title="Nach hinten"
                    className="border border-[#E8E5DC] p-1 hover:bg-[#E8E5DC] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3 text-[#1A1A1A]" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  title="Bild löschen"
                  className="border border-transparent p-1 text-red-400 hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
