"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";

type CertificateUploaderProps = {
  value: string;
  onChange: (url: string) => void;
};

export function CertificateUploader({ value, onChange }: CertificateUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Nur PDF-Dateien sind erlaubt.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("PDF-Datei darf maximal 10 MB groß sein.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1) Get signed upload signature for documents
      const sigRes = await fetch(
        "/api/admin/upload-signature?type=document&folder=sona-boutique/certificates"
      );
      if (!sigRes.ok) throw new Error("Konnte Upload-Signatur nicht abrufen.");
      const sig = await sigRes.json();

      // 2) Build form data for Cloudinary direct upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);
      formData.append("resource_type", "auto");

      // 3) Upload directly to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error?.message || "Upload fehlgeschlagen.");
      }

      const uploadData = await uploadRes.json();
      onChange(uploadData.secure_url);
    } catch (err: any) {
      setError(err.message || "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {/* Upload area */}
        {!value ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer items-center gap-3 border border-dashed p-4 text-xs transition-colors hover:border-[#C5A880] ${
              uploading ? "border-[#C5A880]/50 bg-[#FAF4EB]" : "border-[#E8E5DC] bg-[#FAF9F6]"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#C5A880]" />
            ) : (
              <UploadCloud className="h-6 w-6 text-[#C5A880]" />
            )}
            <div>
              <p className="font-medium text-[#1A1A1A]">
                {uploading ? "Wird hochgeladen..." : "Prüfzertifikat (PDF) hochladen"}
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-[#6B6B6B]">
                Max. 10 MB · nur PDF
              </p>
            </div>
          </div>
        ) : (
          /* Uploaded file display */
          <div className="flex w-full items-center justify-between border border-[#E8E5DC] bg-white p-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#C5A880]" />
              <div>
                <p className="text-xs font-medium text-[#1A1A1A]">Prüfzertifikat hochgeladen</p>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] text-[#C5A880] underline hover:no-underline"
                >
                  PDF öffnen →
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-[#B91C1C]">
          <XCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}