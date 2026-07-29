import { NextResponse } from "next/server";

export async function GET() {
  const collections = [
    {
      id: "investment",
      name: "Investment Pieces",
      slug: "investment",
      description:
        "Wertstabile Handtaschenikonen von Hermès und Chanel mit nachgewiesener Wertsteigerung.",
      imageUrl:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: "quiet-luxury",
      name: "Quiet Luxury",
      slug: "quiet-luxury",
      description:
        "Subtile Eleganz ohne auffällige Logos — Bottega Veneta, Celine und Saint Laurent.",
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: "new-arrivals",
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "Frisch eingetroffene, neu zertifizierte Einzelstücke der besten Modehäuser.",
      imageUrl:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  return NextResponse.json({ collections });
}
