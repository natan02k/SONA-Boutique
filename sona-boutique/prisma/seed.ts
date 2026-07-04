import { db } from "@/lib/db";
import { hash } from "@node-rs/argon2";

async function main() {
  console.log("Starte Seed-Vorgang...");

  // Brands (upsert um Doppelungen zu vermeiden)
  const brandData = [
    { id: "hermes", name: "Hermès", slug: "hermes", country: "FR", sortOrder: 1 },
    { id: "chanel", name: "Chanel", slug: "chanel", country: "FR", sortOrder: 2 },
    { id: "louis-vuitton", name: "Louis Vuitton", slug: "louis-vuitton", country: "FR", sortOrder: 3 },
    { id: "bottega-veneta", name: "Bottega Veneta", slug: "bottega-veneta", country: "IT", sortOrder: 4 },
    { id: "saint-laurent", name: "Saint Laurent", slug: "saint-laurent", country: "FR", sortOrder: 5 },
    { id: "prada", name: "Prada", slug: "prada", country: "IT", sortOrder: 6 },
    { id: "dior", name: "Dior", slug: "dior", country: "FR", sortOrder: 7 },
    { id: "goyard", name: "Goyard", slug: "goyard", country: "FR", sortOrder: 8 },
    { id: "gucci", name: "Gucci", slug: "gucci", country: "IT", sortOrder: 9 },
    { id: "mcm", name: "MCM", slug: "mcm", country: "DE", sortOrder: 10 },
  ];
  
  for (const brand of brandData) {
    await db.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }
  const brands = await db.brand.count();
  console.log(`✅ ${brands} Brands vorhanden`);

  // Categories (upsert)
  const categoryData = [
    { id: "tote-bags", name: "Tote Bags", slug: "tote-bags", sortOrder: 1 },
    { id: "shoulder-bags", name: "Shoulder Bags", slug: "shoulder-bags", sortOrder: 2 },
    { id: "crossbody-bags", name: "Crossbody Bags", slug: "crossbody-bags", sortOrder: 3 },
    { id: "top-handle", name: "Top Handle", slug: "top-handle", sortOrder: 4 },
    { id: "mini-micro", name: "Mini & Micro", slug: "mini-micro", sortOrder: 5 },
    { id: "clutches", name: "Clutches", slug: "clutches", sortOrder: 6 },
  ];
  
  for (const category of categoryData) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  const categories = await db.category.count();
  console.log(`✅ ${categories} Categories vorhanden`);

  // Products (upsert)
  const productCount = await db.product.count();
  if (productCount === 0) {
    await db.product.createMany({
      data: [
        {
          id: "hermes-birkin-30-gold",
          slug: "hermes-birkin-30-gold",
          title: "Hermès Birkin 30 Togo Gold",
          subtitle: "Exemplarischer Zustand mit Ursprungsverpackung",
          description: "Der legendäre Birkin von Hermès in exzellentem Zustand. Dieses exklusive Taschenstück aus Leder ist ein Investment in die Luxuswelt. Die goldene Hardware und das charakteristische H-Brand-Logo machen diese Tasche zu einem Meisterwerk der Französisch-italienischen Luxusmarke.",
          status: "PUBLISHED",
          brandId: "hermes",
          categoryId: "tote-bags",
          material: "Kuhleder (Togo)",
          color: "Gold",
          hardware: "GOLD",
          originCountry: "FR",
          manufacturingYear: 2023,
          condition: "PRISTINE",
          conditionNotes: "Keine Gebrauchsspuren, original verpackt",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0001",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: true,
          retailPriceCents: 2500000,
          resalePriceCents: 2250000,
          compareAtPriceCents: 2500000,
          sku: "HERMES-BIRKIN-30-GOLD",
          inventoryQuantity: 1,
          weightGrams: 1200,
          isFeatured: true,
          featuredRank: 1,
        },
        {
          id: "chanel-flap-medium-black",
          slug: "chanel-flap-medium-black",
          title: "Chanel Classic Flap Medium Black",
          subtitle: "Perfekt erhalten mit Zertifikat",
          description: "Die ikonische Chanel Classic Flap in schwarz. Diese Tasche ist ein Kultstück der Modegeschichte. Das Leder ist vollständig glatt, die Hardware in Gold ist perfekt.",
          status: "PUBLISHED",
          brandId: "chanel",
          categoryId: "shoulder-bags",
          material: "Kuhleder ( Caviar )",
          color: "Schwarz",
          hardware: "GOLD",
          originCountry: "FR",
          manufacturingYear: 2022,
          condition: "EXCELLENT",
          conditionNotes: "Minimale Gebrauchsspuren, vollständig mit Zertifikat",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0002",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: false,
          includesAuthenticityCard: true,
          retailPriceCents: 950000,
          resalePriceCents: 890000,
          compareAtPriceCents: 950000,
          sku: "CHANEL-FLAP-MED-BLACK",
          inventoryQuantity: 1,
          weightGrams: 800,
          isFeatured: true,
          featuredRank: 2,
        },
        {
          id: "lv-speedy-25-monogram",
          slug: "lv-speedy-25-monogram",
          title: "Louis Vuitton Speedy 25 Monogram",
          subtitle: "Klassiker mit Nachfolger-Qualität",
          description: "Die Klassische Speedy 25 von Louis Vuitton in Monogramm-Stoff. Eine der ikonischsten Taschen der Welt. Das Taschenmaterial ist in perfektem Zustand.",
          status: "PUBLISHED",
          brandId: "louis-vuitton",
          categoryId: "tote-bags",
          material: "Monogrammstoff (Canvas)",
          color: "Monogramm",
          hardware: "SILVER",
          originCountry: "FR",
          manufacturingYear: 2021,
          condition: "VERY_GOOD",
          conditionNotes: "Leichte Gebrauchsspuren am Boden, sonst perfekt",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0003",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: false,
          retailPriceCents: 120000,
          resalePriceCents: 98000,
          compareAtPriceCents: 120000,
          sku: "LV-SPEEDY-25-MONO",
          inventoryQuantity: 1,
          weightGrams: 600,
          isFeatured: true,
          featuredRank: 3,
        },
        {
          id: "bv-mini-jodhpur-brown",
          slug: "bv-mini-jodhpur-brown",
          title: "Bottega Veneta Mini Jodhpur Brown",
          subtitle: "Design-Icon mit Intrecci-Technik",
          description: "Die Mini Jodhpur von Bottega Veneta in reizvollem Brauntone. Das Iconic Intrecci-Weave ist ein Meisterstück der Marke. Die Tasche ist mit originalem Dust-Bag erhältlich.",
          status: "PUBLISHED",
          brandId: "bottega-veneta",
          categoryId: "mini-micro",
          material: "Intrecci-Weave (Kuhleder)",
          color: "Braun",
          hardware: "PALLADIUM",
          originCountry: "IT",
          manufacturingYear: 2023,
          condition: "PRISTINE",
          conditionNotes: "Neuwertig, nie getragen",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0004",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: false,
          includesAuthenticityCard: true,
          retailPriceCents: 380000,
          resalePriceCents: 365000,
          compareAtPriceCents: 380000,
          sku: "BV-JODHPUR-MINI-BROWN",
          inventoryQuantity: 1,
          weightGrams: 400,
          isFeatured: true,
          featuredRank: 4,
        },
        {
          id: "sylvie-small-black",
          slug: "sylvie-small-black",
          title: "Saint Laurent Louboutin Sylvie Small Black",
          subtitle: "Elegante Silhouette mit Red Sole",
          description: "Die Sylvie Small von Saint Laurent ist eine elegante, minimalistische Tasche. Das charakteristische Red-Sole Design ist das Markenzeichen.",
          status: "PUBLISHED",
          brandId: "saint-laurent",
          categoryId: "shoulder-bags",
          material: "Kuhleder (Calf)",
          color: "Schwarz",
          hardware: "GOLD",
          originCountry: "FR",
          manufacturingYear: 2022,
          condition: "EXCELLENT",
          conditionNotes: "Geringe Gebrauchsspuren, vollständig",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0005",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: false,
          includesAuthenticityCard: false,
          retailPriceCents: 260000,
          resalePriceCents: 245000,
          compareAtPriceCents: 260000,
          sku: "YSL-SYLVE-SMALL-BLACK",
          inventoryQuantity: 1,
          weightGrams: 350,
          isFeatured: false,
          featuredRank: 0,
        },
        {
          id: "prada-re-edition-2005-black",
          slug: "prada-re-edition-2005-black",
          title: "Prada Re-Edition 2005 Black",
          subtitle: "Retro-Design mit Moderne",
          description: "Die Re-Edition 2005 von Prada ist ein ikonisches Stück. Das schwarze Nappa-Leder mit dem charakteristischen Triangle-Logo.",
          status: "PUBLISHED",
          brandId: "prada",
          categoryId: "shoulder-bags",
          material: "Nappa-Leder",
          color: "Schwarz",
          hardware: "SILVER",
          originCountry: "IT",
          manufacturingYear: 2021,
          condition: "VERY_GOOD",
          conditionNotes: "Leichte Abnutzungsspuren, aber vollständig funktional",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0006",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: false,
          retailPriceCents: 135000,
          resalePriceCents: 119000,
          compareAtPriceCents: 135000,
          sku: "PRADA-RE-EDITION-2005",
          inventoryQuantity: 1,
          weightGrams: 500,
          isFeatured: false,
          featuredRank: 0,
        },
        {
          id: "dior-saddle-blue",
          slug: "dior-saddle-blue",
          title: "Dior Saddle Blue Oblique",
          subtitle: "Kultige Tasche in Blau",
          description: "Die Saddle Tasche von Dior in einem der ikonischsten Farben der Marke. Das Oblique-Logo ist präsent und die Tasche ist in perfektem Zustand.",
          status: "PUBLISHED",
          brandId: "dior",
          categoryId: "shoulder-bags",
          material: "Leder (Calfskin)",
          color: "Blau",
          hardware: "GOLD",
          originCountry: "FR",
          manufacturingYear: 2023,
          condition: "PRISTINE",
          conditionNotes: "Neuwertig, nie getragen",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0007",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: true,
          retailPriceCents: 365000,
          resalePriceCents: 345000,
          compareAtPriceCents: 365000,
          sku: "DIOR-SADDLE-BLUE",
          inventoryQuantity: 1,
          weightGrams: 450,
          isFeatured: false,
          featuredRank: 0,
        },
        {
          id: "goyard-saint-louis-pm-black",
          slug: "goyard-saint-louis-pm-black",
          title: "Goyard Saint Louis PM Black",
          subtitle: "Klassische Straw-Tasche",
          description: "Die Saint Louis PM von Goyard in schwarz. Das charakteristische Straw-Design und das Goyard-Logo machen diese Tasche zu einem Klassiker.",
          status: "PUBLISHED",
          brandId: "goyard",
          categoryId: "tote-bags",
          material: "Straw (Gewebt)",
          color: "Schwarz",
          hardware: "SILVER",
          originCountry: "FR",
          manufacturingYear: 2022,
          condition: "VERY_GOOD",
          conditionNotes: "Geringe Gebrauchsspuren, vollständig",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0008",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: false,
          includesAuthenticityCard: false,
          retailPriceCents: 160000,
          resalePriceCents: 145000,
          compareAtPriceCents: 160000,
          sku: "GOYARD-SAINT-LOUIS-PM",
          inventoryQuantity: 1,
          weightGrams: 550,
          isFeatured: false,
          featuredRank: 0,
        },
        {
          id: "gucci-marmont-small-black",
          slug: "gucci-marmont-small-black",
          title: "Gucci Marmont Small Black",
          subtitle: "Iconische Tasche mit Snake-Detail",
          description: "Die Marmont Small von Gucci in schwarzem Leder. Das charakteristische Snake-Logo ist auf der Tasche präsent.",
          status: "PUBLISHED",
          brandId: "gucci",
          categoryId: "shoulder-bags",
          material: "Kuhleder (Oryguntal)",
          color: "Schwarz",
          hardware: "GOLD",
          originCountry: "IT",
          manufacturingYear: 2023,
          condition: "PRISTINE",
          conditionNotes: "Neuwertig, nie getragen",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0009",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: true,
          retailPriceCents: 195000,
          resalePriceCents: 189000,
          compareAtPriceCents: 195000,
          sku: "GUCCI-MARMONT-SMALL",
          inventoryQuantity: 1,
          weightGrams: 400,
          isFeatured: false,
          featuredRank: 0,
        },
        {
          id: "mcm-stark-backpack-visetos",
          slug: "mcm-stark-backpack-visetos",
          title: "MCM Stark Backpack Visetos",
          subtitle: "Modernes Design aus Mailand",
          description: "Die Stark Backpack von MCM in Visetos-Nummerierung. Ein moderner Twist auf eine Kultklasse.",
          status: "PUBLISHED",
          brandId: "mcm",
          categoryId: "tote-bags",
          material: "Visetos (Kunststoff)",
          color: "Schwarz",
          hardware: "SILVER",
          originCountry: "DE",
          manufacturingYear: 2023,
          condition: "EXCELLENT",
          conditionNotes: "Geringe Gebrauchsspuren, vollständig",
          isAuthenticityVerified: true,
          authenticityCertNo: "LX-2026-0010",
          includesOriginalBox: true,
          includesDustBag: true,
          includesReceipt: true,
          includesAuthenticityCard: false,
          retailPriceCents: 110000,
          resalePriceCents: 98000,
          compareAtPriceCents: 110000,
          sku: "MCM-STARK-BACKPACK",
          inventoryQuantity: 1,
          weightGrams: 1500,
          isFeatured: false,
          featuredRank: 0,
        },
      ],
    });
    console.log(`✅ 10 Products erstellt`);
  } else {
    console.log(`✅ ${productCount} Products bereits vorhanden`);
  }

  // Product Images (upsert)
  const imageCount = await db.productImage.count();
  if (imageCount === 0) {
    await db.productImage.createMany({
      data: [
        { productId: "hermes-birkin-30-gold", url: "https://images.unsplash.com/photo/158443307777-6e3a6a4f5d0d?w=1200", altText: "Hermès Birkin 30 Gold", position: 0, isPrimary: true },
        { productId: "chanel-flap-medium-black", url: "https://images.unsplash.com/photo/1566647952449-5d094d3c4e0d?w=1200", altText: "Chanel Classic Flap", position: 0, isPrimary: true },
        { productId: "lv-speedy-25-monogram", url: "https://images.unsplash.com/photo/1554520681-7ac65d85c58f?w=1200", altText: "LV Speedy 25 Monogram", position: 0, isPrimary: true },
        { productId: "bv-mini-jodhpur-brown", url: "https://images.unsplash.com/photo/158443307777-6e3a6a4f5d0d?w=1200", altText: "Bottega Veneta Jodhpur", position: 0, isPrimary: true },
        { productId: "sylvie-small-black", url: "https://images.unsplash.com/photo/1566647952449-5d094d3c4e0d?w=1200", altText: "YSL Sylvie Small", position: 0, isPrimary: true },
        { productId: "prada-re-edition-2005-black", url: "https://images.unsplash.com/photo/1554520681-7ac65d85c58f?w=1200", altText: "Prada Re-Edition", position: 0, isPrimary: true },
        { productId: "dior-saddle-blue", url: "https://images.unsplash.com/photo/158443307777-6e3a6a4f5d0d?w=1200", altText: "Dior Saddle Blue", position: 0, isPrimary: true },
        { productId: "goyard-saint-louis-pm-black", url: "https://images.unsplash.com/photo/1566647952449-5d094d3c4e0d?w=1200", altText: "Goyard Saint Louis", position: 0, isPrimary: true },
        { productId: "gucci-marmont-small-black", url: "https://images.unsplash.com/photo/1554520681-7ac65d85c58f?w=1200", altText: "Gucci Marmont", position: 0, isPrimary: true },
        { productId: "mcm-stark-backpack-visetos", url: "https://images.unsplash.com/photo/158443307777-6e3a6a4f5d0d?w=1200", altText: "MCM Stark Backpack", position: 0, isPrimary: true },
      ],
    });
    console.log(`✅ 10 Product Images erstellt`);
  } else {
    console.log(`✅ ${imageCount} Product Images bereits vorhanden`);
  }

  // Promo Codes (upsert)
  const welcome10 = await db.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrderCents: 50000, usageLimit: 100, isActive: true },
  });
  const vip500 = await db.promoCode.upsert({
    where: { code: "VIP500" },
    update: {},
    create: { code: "VIP500", type: "FIXED", value: 50000, minOrderCents: 500000, usageLimit: 50, isActive: true },
  });
  console.log(`✅ 2 Promo Codes erstellt`);

  // Admin User
  const adminPasswordHash = await hash("admin1234");
  const admin = await db.customer.create({
    data: {
      email: "admin@sona-boutique.de",
      passwordHash: adminPasswordHash,
      firstName: "SONA",
      lastName: "Admin",
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log(`✅ Admin User erstellt: ${admin.email}`);

  // Demo Customer
  const customerPasswordHash = await hash("demo1234");
  const customer = await db.customer.create({
    data: {
      email: "kunde@demo.de",
      passwordHash: customerPasswordHash,
      firstName: "Max",
      lastName: "Mustermann",
      phone: "+49 171 1234567",
      role: "CUSTOMER",
      isVerified: true,
      addresses: {
        create: {
          firstName: "Max",
          lastName: "Mustermann",
          street1: "Musterstraße 1",
          street2: null,
          city: "Berlin",
          postalCode: "10115",
          country: "DE",
          phone: "+49 171 1234567",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Demo Customer erstellt: ${customer.email}`);

  console.log("\n✅ Seed-Vorgang abgeschlossen!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });