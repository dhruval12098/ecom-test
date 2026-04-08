import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import ApiService from "@/lib/api";
import ProductDetailsClient, { ProductDetails } from "@/components/product/ProductDetailsClient";

export const revalidate = 300;

type PageParams = {
  category: string;
  subcategory: string;
  product: string;
};

const safeDecode = (value?: string | null) => {
  if (!value) return "";
  if (!value.includes("%")) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const category = safeDecode(resolvedParams?.category);
  const subcategory = safeDecode(resolvedParams?.subcategory);
  const productSlug = safeDecode(resolvedParams?.product);

  if (!productSlug) {
    return {
      title: "Product Not Found | Tulsi",
      description: "The requested product could not be found."
    };
  }

  const normalizedSlug = productSlug
    ? productSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  const categories = await ApiService.getSpecialCategoriesTree();
  const foundCategory = categories.find((cat: any) => cat.slug === category) || null;
  const allProducts = [
    ...(foundCategory?.category_products || []),
    ...(foundCategory?.subcategories || []).flatMap((sub: any) => sub.products || [])
  ];
  const foundProduct =
    allProducts.find((p: any) => String(p.slug || p.id) === productSlug) ||
    (normalizedSlug ? allProducts.find((p: any) => String(p.slug || p.id) === normalizedSlug) : null);

  if (!foundProduct) {
    return {
      title: "Product Not Found | Tulsi",
      description: "The requested product could not be found."
    };
  }

  const name = String(foundProduct.name || "Product").trim();
  const title = name ? `${name} | Tulsi` : "Product | Tulsi";
  const description =
    String(foundProduct.description || "").trim() ||
    `Discover ${name} at Tulsi - authentic Indian groceries delivered in Ghent.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/special/${category}/${subcategory}/${foundProduct.slug || foundProduct.id || productSlug}`,
      images: foundProduct.imageUrl || foundProduct.image_url ? [
        { url: foundProduct.imageUrl || foundProduct.image_url }
      ] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function SpecialProductDetailsPage({
  params
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const categoryParam = safeDecode(resolvedParams?.category);
  const subcategoryParam = safeDecode(resolvedParams?.subcategory);
  const productSlug = safeDecode(resolvedParams?.product);

  if (!categoryParam || !productSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

  const categories = await ApiService.getSpecialCategoriesTree();
  const foundCategory =
    categories.find((cat: any) => cat.slug === categoryParam) || null;

  if (!foundCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

  const allProducts = [
    ...(foundCategory?.category_products || []),
    ...(foundCategory?.subcategories || []).flatMap((sub: any) => sub.products || [])
  ];
  const normalizedSlug = productSlug
    ? productSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
  const foundProduct =
    allProducts.find((p: any) => String(p.slug || p.id) === productSlug) ||
    (normalizedSlug ? allProducts.find((p: any) => String(p.slug || p.id) === normalizedSlug) : null);

  if (!foundProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

  const resolvedSubcategory =
    (foundCategory.subcategories || []).find((sub: any) =>
      sub.products?.some((p: any) => String(p.id) === String(foundProduct.id))
    ) || null;
  const subSlug = resolvedSubcategory?.slug || subcategoryParam || "all";

  const product: ProductDetails = {
    ...foundProduct,
    slug: foundProduct.slug || (foundProduct.id !== undefined ? String(foundProduct.id) : productSlug),
    category: `special/${foundCategory.slug}`,
    subcategory: subSlug,
    isSpecial: true,
    category_id: foundCategory.id,
    subcategory_id: resolvedSubcategory?.id ?? null,
    bulk_order_limit: foundProduct.bulk_order_limit ?? foundProduct.bulkOrderLimit ?? null,
    preorder_only: foundProduct.preorder_only ?? foundProduct.preorderOnly ?? null,
    cutoff_time: foundProduct.cutoff_time ?? foundProduct.cutoffTime ?? null,
    available_days: foundProduct.available_days ?? foundProduct.availableDays ?? null,
    label_name: foundProduct.label_name ?? foundProduct.labelName ?? null,
    label_color: foundProduct.label_color ?? foundProduct.labelColor ?? null
  };

  let initialSchedule = null;
  try {
    initialSchedule = await ApiService.getActiveSchedule(product.id, null, { isSpecial: true });
  } catch {
    initialSchedule = null;
  }

  return (
    <div className="min-h-screen bg-white fade-in">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <Link href={`/special/${foundCategory.slug}`} className="hover:text-green-600">
              {foundCategory.slug
                .split("-")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <Link href={`/special/${foundCategory.slug}/${subSlug}`} className="hover:text-green-600">
              {subSlug
                .split("-")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">
              {(product.slug || "").split("-").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
            </span>
          </div>
        </div>
      </div>

      <ProductDetailsClient
        product={product}
        initialReviewSummary={{ count: 0, avg_rating: 0 }}
        initialSchedule={initialSchedule}
      />
    </div>
  );
}
