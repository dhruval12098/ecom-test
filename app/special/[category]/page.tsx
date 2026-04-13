import Link from "next/link";
import { Home, ChevronRight, Truck } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import ApiService from "@/lib/api";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number | null;
  mainVariantId?: number | null;
  imageUrl: string;
  discountPercentage: string;
  discountColor: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  isSpecial?: boolean;
  category_id?: number | null;
  subcategory_id?: number | null;
  bulk_order_limit?: number | null;
  preorder_only?: boolean | null;
  cutoff_time?: string | null;
  available_days?: string[] | null;
  label_name?: string | null;
  label_color?: string | null;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  pickup_only?: boolean | null;
  pickup_address?: string | null;
  subcategories: Subcategory[];
  category_products?: Product[];
}

type PageParams = {
  category: string;
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
  const rawSlug = safeDecode(resolvedParams?.category);
  if (!rawSlug) {
    return {
      title: "Special Category Not Found | Tulsi",
      description: "The requested special category could not be found."
    };
  }
  const normalizedSlug = rawSlug
    ? rawSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
  const categories: Category[] = await ApiService.getSpecialCategoriesTree({ bypassCache: true });
  const foundCategory =
    categories.find((cat) => cat.slug === rawSlug) ||
    (normalizedSlug ? categories.find((cat) => cat.slug === normalizedSlug) : null);

  const title = foundCategory?.name
    ? `${foundCategory.name} | Tulsi`
    : "Special Category | Tulsi";
  const description =
    foundCategory?.description ||
    "Browse special menus at Tulsi.";

  return { title, description };
}

export default async function SpecialCategoryPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const categoryParam = safeDecode(resolvedParams?.category);
  if (!categoryParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Special Category Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another category.</div>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const normalizedSlug = categoryParam
    ? categoryParam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  const categories: Category[] = await ApiService.getSpecialCategoriesTree({ bypassCache: true });
  const foundCategory =
    categories.find((cat) => cat.slug === categoryParam) ||
    (normalizedSlug ? categories.find((cat) => cat.slug === normalizedSlug) : null);

  if (!foundCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Special Category Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another category.</div>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const allProducts: Product[] = [];
  foundCategory.subcategories.forEach((sub) => {
    sub.products.forEach((product: any) => {
      const normalizedSlug =
        product.slug ||
        product.product_slug ||
        (product.id !== undefined && product.id !== null ? String(product.id) : null);
      allProducts.push({
        id: product.id,
        name: product.name,
        slug: normalizedSlug || "",
        category: `special/${foundCategory.slug}`,
        subcategory: sub.slug,
        price: Number(product.price || 0),
        originalPrice: product.originalPrice ?? product.original_price ?? null,
        mainVariantId: product.mainVariantId ?? product.main_variant_id ?? null,
        imageUrl:
          product.imageUrl ||
          product.image_url ||
          product.image ||
          (Array.isArray(product.imageGallery) ? product.imageGallery[0] : undefined) ||
          (Array.isArray(product.image_gallery) ? product.image_gallery[0] : undefined) ||
          "",
        discountPercentage: product.discountPercentage || product.discount_percentage || "",
        discountColor: product.discountColor || product.discount_color || "bg-red-500",
        description: product.description || "",
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        inStock: product.inStock ?? product.in_stock ?? true,
        weight: product.weight || "",
        origin: product.origin || "",
        isSpecial: true,
        category_id: foundCategory.id,
        subcategory_id: sub.id,
        bulk_order_limit: product.bulk_order_limit ?? product.bulkOrderLimit ?? null,
        preorder_only: product.preorder_only ?? product.preorderOnly ?? null,
        cutoff_time: product.cutoff_time ?? product.cutoffTime ?? null,
        available_days: product.available_days ?? product.availableDays ?? null,
        label_name: product.label_name ?? product.labelName ?? null,
        label_color: product.label_color ?? product.labelColor ?? null
      });
    });
  });

  (foundCategory.category_products || []).forEach((product: any) => {
    const normalizedSlug =
      product.slug ||
      product.product_slug ||
      (product.id !== undefined && product.id !== null ? String(product.id) : null);
    allProducts.push({
      id: product.id,
      name: product.name,
      slug: normalizedSlug || "",
      category: `special/${foundCategory.slug}`,
      subcategory: "all",
      price: Number(product.price || 0),
      originalPrice: product.originalPrice ?? product.original_price ?? null,
      mainVariantId: product.mainVariantId ?? product.main_variant_id ?? null,
      imageUrl:
        product.imageUrl ||
        product.image_url ||
        product.image ||
        (Array.isArray(product.imageGallery) ? product.imageGallery[0] : undefined) ||
        (Array.isArray(product.image_gallery) ? product.image_gallery[0] : undefined) ||
        "",
      discountPercentage: product.discountPercentage || product.discount_percentage || "",
      discountColor: product.discountColor || product.discount_color || "bg-red-500",
      description: product.description || "",
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      inStock: product.inStock ?? product.in_stock ?? true,
      weight: product.weight || "",
      origin: product.origin || "",
      isSpecial: true,
      category_id: foundCategory.id,
      subcategory_id: null,
      bulk_order_limit: product.bulk_order_limit ?? product.bulkOrderLimit ?? null,
      preorder_only: product.preorder_only ?? product.preorderOnly ?? null,
      cutoff_time: product.cutoff_time ?? product.cutoffTime ?? null,
      available_days: product.available_days ?? product.availableDays ?? null,
      label_name: product.label_name ?? product.labelName ?? null,
      label_color: product.label_color ?? product.labelColor ?? null
    });
  });

  const schedules = await Promise.all(
    allProducts.map((product) => ApiService.getActiveSchedule(product.id, null, { isSpecial: true }))
  );
  const productsWithSchedules = allProducts.map((product, index) => {
    const schedule = schedules[index];
    if (!schedule) return product;
    const scheduledPrice = Number(schedule.scheduled_price ?? schedule.scheduledPrice);
    const normalPrice = Number(
      schedule.normal_price ?? schedule.normalPrice ?? product.originalPrice ?? product.price
    );
    const finalPrice = Number.isFinite(scheduledPrice) ? scheduledPrice : product.price;
    const finalOriginal =
      Number.isFinite(normalPrice) && normalPrice > finalPrice ? normalPrice : product.originalPrice;
    const discountPercent = schedule.discount_percent ?? schedule.discountPercent;
    const computedDiscount =
      discountPercent !== null && discountPercent !== undefined
        ? `${Number(discountPercent).toFixed(0)}%`
        : Number.isFinite(normalPrice) && normalPrice > finalPrice
          ? `${Math.round(((normalPrice - finalPrice) / normalPrice) * 100)}%`
          : product.discountPercentage;

    return {
      ...product,
      price: finalPrice,
      originalPrice: finalOriginal,
      discountPercentage: computedDiscount || product.discountPercentage
    };
  });

  const activeSubcategory = "all";
  const filteredProducts = productsWithSchedules;
  const subcats = [{ name: "All", slug: "all" }, ...foundCategory.subcategories];

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* Breadcrumb */}
      <div className="bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-300">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <span className="font-medium">{foundCategory.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{foundCategory.name}</h1>
          <p className="text-xs md:text-sm text-gray-600">{foundCategory.description}</p>
          {(foundCategory.pickup_address || foundCategory.pickup_only) && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-500 bg-green-50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-green-500 bg-green-100">
                <Truck className="h-5 w-5 text-green-700" />
              </div>
              <div className="text-sm text-gray-800">
                <div className="font-semibold">
                  {foundCategory.pickup_only ? "Pickup only" : "Pickup available"}
                </div>
                {foundCategory.pickup_address && (
                  <div className="text-xs text-gray-600">{foundCategory.pickup_address}</div>
                )}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {foundCategory.subcategories.length} Subcategories
            </span>
            <span className="text-sm text-gray-500">{filteredProducts.length} Products</span>
          </div>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {subcats.map((sub) => (
              <Link
                key={sub.slug}
                href={`/special/${foundCategory.slug}/${sub.slug}`}
                className={`whitespace-nowrap pb-2 px-1 border-b border-gray-200 font-medium text-sm transition-colors ${
                  activeSubcategory === sub.slug
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sub.name} (
                {sub.slug !== "all"
                  ? filteredProducts.filter((p) => p.subcategory === sub.slug).length
                  : filteredProducts.length}
                )
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 xl:px-[50px] py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
          <div className="text-sm text-gray-600">{filteredProducts.length} products</div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={`${product.id}-${product.subcategory}`}
                titleClassName="line-clamp-2"
                size="compact"
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
