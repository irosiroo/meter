import type { MetadataRoute } from "next";
import { ALL_SPECS } from "@/data/calculators";
import { CATEGORY_IDS } from "@/data/categories";
import { SITE } from "@/lib/utils";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/all-tools`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
  ];

  // إضافة الأقسام والفئات أوتوماتيكياً
  for (const id of CATEGORY_IDS) {
    entries.push({ url: `${base}/categories/${id}`, changeFrequency: "monthly", priority: 0.6 });
  }

  // الروابط الأصلية القديمة للحاسبات
  for (const spec of ALL_SPECS) {
    entries.push({ url: `${base}/calculator/${spec.id}`, changeFrequency: "monthly", priority: 0.7 });
  }

  // **الإضافة الجديدة الخارقة:** توليد روابط الـ Programmatic SEO الديناميكية لكل الحاسبات تلقائياً
  for (const spec of ALL_SPECS) {
    entries.push({ 
      url: `${base}/calc/${spec.id}`, 
      changeFrequency: "weekly", 
      priority: 0.9 
    });
  }

  return entries;
}
