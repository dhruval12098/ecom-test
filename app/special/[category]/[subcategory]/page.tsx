import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import ApiService from "@/lib/api";

export const revalidate = 300;

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
  description?: string | null;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  subcategories: Subcategory[];
  category_products?: Product[];
}

type PageParams = {
  category: string;
  subcategory: string;
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
  const rawCategory = safeDecode(resolvedParams?.category);
  const rawSubcategory = safeDecode(resolvedParams?.subcategory);
  if (!rawCategory || !rawSubcategory) {
    return {
      title: "Special Subcategory Not Found | Tulsi",
      description: "The requested special subcategory could not be found."
    };
  }
  const normalizedCategory = rawCategory
    ? rawCategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
  const normalizedSub = rawSubcategory
    ? rawSubcategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  const categories: Category[] = await ApiService.getSpecialCategoriesTree();
  const foundCategory =
    categories.find((cat) => cat.slug === rawCategory) ||
    (normalizedCategory ? categories.find((cat) => cat.slug === normalizedCategory) : null);

  const foundSub =
    foundCategory?.subcategories.find((sub) => sub.slug === rawSubcategory) ||
    (normalizedSub ? foundCategory?.subcategories.find((sub) => sub.slug === normalizedSub) : null);

  const title = foundSub?.name
    ? `${foundSub.name} | ${foundCategory?.name || "Tulsi"}`
    : "Special Subcategory | Tulsi";
  const description =
    foundCategory?.description ||
    "Browse special menus at Tulsi.";

  return { title, description };
}

export default async function SpecialSubcategoryPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const categoryParam = safeDecode(resolvedParams?.category);
  const subcategoryParam = safeDecode(resolvedParams?.subcategory);
  if (!categoryParam || !subcategoryParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Special Subcategory Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another subcategory.</div>
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

  const normalizedCategory = categoryParam
    ? categoryParam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
  const normalizedSub = subcategoryParam
    ? subcategoryParam.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  const categories: Category[] = await ApiService.getSpecialCategoriesTree();
  const foundCategory =
    categories.find((cat) => cat.slug === categoryParam) ||
    (normalizedCategory ? categories.find((cat) => cat.slug === normalizedCategory) : null);

  if (!foundCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Special Subcategory Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another subcategory.</div>
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

  const currentSubcategory =
    subcategoryParam === "all" || normalizedSub === "all"
      ? null
      : foundCategory.subcategories.find((sub) => sub.slug === subcategoryParam) ||
        (normalizedSub ? foundCategory.subcategories.find((sub) => sub.slug === normalizedSub) : null);

  if (!currentSubcategory && subcategoryParam !== "all" && normalizedSub !== "all") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Special Subcategory Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another subcategory.</div>
          <Link
            href={`/special/${foundCategory.slug}`}
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Category
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

  const products: Product[] =
    subcategoryParam === "all" || normalizedSub === "all"
      ? allProducts
      : (currentSubcategory?.products || []).map((product: any) => {
          const normalizedSlug =
            product.slug ||
            product.product_slug ||
            (product.id !== undefined && product.id !== null ? String(product.id) : null);
          return {
            id: product.id,
            name: product.name,
            slug: normalizedSlug || "",
            category: `special/${foundCategory.slug}`,
            subcategory: currentSubcategory?.slug || "all",
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
            subcategory_id: currentSubcategory?.id ?? null,
            bulk_order_limit: product.bulk_order_limit ?? product.bulkOrderLimit ?? null,
            preorder_only: product.preorder_only ?? product.preorderOnly ?? null,
            cutoff_time: product.cutoff_time ?? product.cutoffTime ?? null,
            available_days: product.available_days ?? product.availableDays ?? null,
            label_name: product.label_name ?? product.labelName ?? null,
            label_color: product.label_color ?? product.labelColor ?? null
          };
        });

  const schedules = await Promise.all(
    products.map((product) => ApiService.getActiveSchedule(product.id, null, { isSpecial: true }))
  );
  const productsWithSchedules = products.map((product, index) => {
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

  const allSubcategories = [{ name: "All", slug: "all" }, ...foundCategory.subcategories];

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
            <Link href={`/special/${foundCategory.slug}`} className="hover:text-green-600">
              {foundCategory.name}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">
              {subcategoryParam === "all" || normalizedSub === "all" ? "All Products" : currentSubcategory?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subcategoryParam === "all" || normalizedSub === "all" ? "All Products" : currentSubcategory?.name}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {subcategoryParam === "all" || normalizedSub === "all"
              ? foundCategory.name
              : (currentSubcategory?.description || foundCategory.name)}
            {" - "}
            {productsWithSchedules.length} products
          </p>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {allSubcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.slug === "all" ? `/special/${foundCategory.slug}` : `/special/${foundCategory.slug}/${sub.slug}`}
                className={`whitespace-nowrap pb-2 px-1 border-b border-gray-200 font-medium text-sm transition-colors ${
                  sub.slug === currentSubcategory?.slug
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sub.name} (
                {sub.slug !== "all"
                  ? (foundCategory.subcategories.find((s) => s.slug === sub.slug)?.products.length || 0)
                  : foundCategory.subcategories.reduce((acc, curr) => acc + curr.products.length, 0) +
                    (foundCategory.category_products?.length || 0)}
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
          <div className="text-sm text-gray-600">{productsWithSchedules.length} products</div>
        </div>

        {productsWithSchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found in this subcategory</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {productsWithSchedules.map((product: Product) => (
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
