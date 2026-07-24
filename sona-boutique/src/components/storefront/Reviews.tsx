import { Star } from "lucide-react";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";

type ReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  createdAt: Date | string;
};

export function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5;

  return (
    <section className="space-y-6 border-t border-[#E8E5DC] pt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="label-luxury block">Kundenmeinungen</span>
          <h3 className="font-serif text-2xl text-[#1A1A1A]">Verifizierte Bewertungen</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex text-[#C5A880]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(averageRating) ? "fill-[#C5A880]" : "text-[#E8E5DC]"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-[#1A1A1A]">
            {averageRating.toFixed(1)} / 5.0 ({reviews.length})
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="border border-[#E8E5DC] bg-white p-8 text-center text-xs text-[#6B6B6B]">
          Noch keine Bewertungen für diese Tasche abgegeben.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((rev) => (
            <div key={rev.id} className="space-y-3 border border-[#E8E5DC] bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1A1A1A]">{rev.authorName}</span>
                {rev.isVerified && <LuxuryBadge variant="green">Verifizierter Kauf</LuxuryBadge>}
              </div>
              <div className="flex text-[#C5A880]">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#C5A880]" />
                ))}
              </div>
              {rev.title && (
                <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">{rev.title}</h4>
              )}
              <p className="text-xs leading-relaxed text-[#6B6B6B]">{rev.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
