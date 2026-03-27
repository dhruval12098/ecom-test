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
  originalPrice: number;
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
  variants?: Array<{
    id?: number | string;
    name?: string | null;
    type?: string | null;
    price?: number | string;
    originalPrice?: number | string | null;
    discountPercentage?: string | null;
    discountColor?: string | null;
  }>;
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
  subcategories: Subcategory[];
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
      title: "Subcategory Not Found | Tulsi",
      description: "The requested subcategory could not be found."
    };
  }

  const normalizedCategory = rawCategory
    ? rawCategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";
  const normalizedSub = rawSubcategory
    ? rawSubcategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  const categories: Category[] = await ApiService.getCategories();
  const foundCategory =
    categories.find((cat) => cat.slug === rawCategory) ||
    (normalizedCategory ? categories.find((cat) => cat.slug === normalizedCategory) : null);
  const foundSub =
    foundCategory?.subcategories.find((sub) => sub.slug === rawSubcategory) ||
    (normalizedSub ? foundCategory?.subcategories.find((sub) => sub.slug === normalizedSub) : null);

  const title = foundSub?.name
    ? `${foundSub.name} | ${foundCategory?.name || "Tulsi"}`
    : "Subcategory | Tulsi";
  const description =
    foundCategory?.description ||
    "Browse authentic Indian grocery subcategories at Tulsi.";

  return { title, description };
}

export default async function SubcategoryPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const categoryParam = safeDecode(resolvedParams?.category);
  const subcategoryParam = safeDecode(resolvedParams?.subcategory);

  if (!categoryParam || !subcategoryParam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Subcategory Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another subcategory.</div>
          <Link
            href={`/${categoryParam || ""}`}
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Category
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

  const categories: Category[] = await ApiService.getCategories();
  const foundCategory =
    categories.find((cat) => cat.slug === categoryParam) ||
    (normalizedCategory ? categories.find((cat) => cat.slug === normalizedCategory) : null);

  if (!foundCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Subcategory Not Found</div>
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
    foundCategory.subcategories.find((sub) => sub.slug === subcategoryParam) ||
    (normalizedSub ? foundCategory.subcategories.find((sub) => sub.slug === normalizedSub) : null);

  if (!currentSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-2">Subcategory Not Found</div>
          <div className="text-gray-600 mb-6">Please choose another subcategory.</div>
          <Link
            href={`/${foundCategory.slug}`}
            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg font-semibold"
          >
            Back to Category
          </Link>
        </div>
      </div>
    );
  }

  const productsWithSlugs = currentSubcategory.products.map((product: any) => {
    const normalizedSlug =
      product.slug ||
      product.product_slug ||
      (product.id !== undefined && product.id !== null ? String(product.id) : null);
    return {
      id: product.id,
      name: product.name,
      slug: normalizedSlug || "",
      category: foundCategory.slug,
      subcategory: currentSubcategory.slug,
      price: Number(product.price || 0),
      originalPrice: product.originalPrice ?? product.original_price ?? null,
      mainVariantId: product.mainVariantId ?? product.main_variant_id ?? null,
      variants: Array.isArray(product.variants) ? product.variants : [],
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
      origin: product.origin || ""
    } as Product;
  });

  const schedules = await Promise.all(
    productsWithSlugs.map((product) => ApiService.getActiveSchedule(product.id))
  );
  const productsWithSchedules = productsWithSlugs.map((product, index) => {
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
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              <Home size={16} />
            </Link>
            <ChevronRight size={16} />
            <Link href={`/${foundCategory.slug}`} className="hover:text-green-600">
              {foundCategory.name}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">{currentSubcategory.name}</span>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentSubcategory.name}</h1>
          <p className="text-lg text-gray-600 mt-1">
            {foundCategory.name} - {productsWithSchedules.length} products
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
                href={sub.slug === "all" ? `/${foundCategory.slug}` : `/${foundCategory.slug}/${sub.slug}`}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  sub.slug === currentSubcategory.slug
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {sub.name} (
                {sub.slug !== "all"
                  ? (foundCategory.subcategories.find((s) => s.slug === sub.slug)?.products.length || 0)
                  : foundCategory.subcategories.reduce((acc, curr) => acc + curr.products.length, 0)}
                )
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
        {productsWithSchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found in this subcategory</div>
          </div>
        ) : (
          <>
            <div className="bg-green-50 rounded-t-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSubcategory.name}</h2>
              <p className="text-gray-600">
                {foundCategory.name} - {productsWithSchedules.length} products
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {productsWithSchedules.map((product) => (
                <ProductCard
                  key={product.id}
                  titleClassName="line-clamp-2"
                  size="compact"
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    mainVariantId: product.mainVariantId,
                    variants: product.variants,
                    imageUrl: product.imageUrl,
                    discountPercentage: product.discountPercentage,
                    discountColor: product.discountColor,
                    description: product.description || "",
                    rating: product.rating,
                    reviews: product.reviews,
                    inStock: product.inStock,
                    weight: product.weight,
                    origin: product.origin,
                    category: product.category,
                    subcategory: product.subcategory,
                    slug: product.slug
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
