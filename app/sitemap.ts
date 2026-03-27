import type { MetadataRoute } from "next";
import ApiService from "@/lib/api";

type Category = {
  slug: string;
  subcategories?: Array<{
    slug: string;
    products?: Array<{ slug?: string; product_slug?: string; id?: number | string }>;
  }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const base: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/about`, lastModified: now },
    { url: `${siteUrl}/contact`, lastModified: now },
    { url: `${siteUrl}/reviews`, lastModified: now },
    { url: `${siteUrl}/support`, lastModified: now },
    { url: `${siteUrl}/faq`, lastModified: now },
    { url: `${siteUrl}/privacy-policy`, lastModified: now },
    { url: `${siteUrl}/terms-and-conditions`, lastModified: now },
    { url: `${siteUrl}/shipping-delivery-policy`, lastModified: now },
    { url: `${siteUrl}/returns`, lastModified: now }
  ];

  try {
    const categories = (await ApiService.getCategories()) as Category[];
    if (!Array.isArray(categories)) return base;

    const urls: MetadataRoute.Sitemap = [];
    categories.forEach((cat) => {
      if (!cat?.slug) return;
      urls.push({ url: `${siteUrl}/${cat.slug}`, lastModified: now });
      (cat.subcategories || []).forEach((sub) => {
        if (!sub?.slug) return;
        urls.push({ url: `${siteUrl}/${cat.slug}/${sub.slug}`, lastModified: now });
        (sub.products || []).forEach((product) => {
          const slug = product?.slug || product?.product_slug || product?.id;
          if (!slug) return;
          urls.push({ url: `${siteUrl}/${cat.slug}/${sub.slug}/${slug}`, lastModified: now });
        });
      });
    });

    return [...base, ...urls];
  } catch {
    return base;
  }
}
