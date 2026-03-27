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

  const isNumericId = /^[0-9]+$/.test(productSlug);
  const normalizedSlug = productSlug
    ? productSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  let foundProduct: any | null = null;
  if (!isNumericId) {
    foundProduct = await ApiService.getProductBySlug(productSlug);
    if (!foundProduct && normalizedSlug && normalizedSlug !== productSlug) {
      foundProduct = await ApiService.getProductBySlug(normalizedSlug);
    }
  }
  if (!foundProduct && isNumericId) {
    foundProduct = await ApiService.getProductById(Number(productSlug));
  }

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
    `Discover ${name} at Tulsi — authentic Indian groceries delivered in Ghent.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${category}/${subcategory}/${foundProduct.slug || foundProduct.id || productSlug}`,
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

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  const subcategory = resolvedParams.subcategory;
  const productSlug = resolvedParams.product ?? "";

  const decodedSlug = safeDecode(productSlug);
  const isNumericId = /^[0-9]+$/.test(decodedSlug);
  const normalizedSlug = decodedSlug
    ? decodedSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "";

  if (!decodedSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

  let foundProduct: any | null = null;
  if (!isNumericId) {
    foundProduct = await ApiService.getProductBySlug(decodedSlug);
    if (!foundProduct && normalizedSlug && normalizedSlug !== decodedSlug) {
      foundProduct = await ApiService.getProductBySlug(normalizedSlug);
    }
  }
  if (!foundProduct && isNumericId) {
    foundProduct = await ApiService.getProductById(Number(decodedSlug));
  }

  if (!foundProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Product not found</div>
      </div>
    );
  }

  const product: ProductDetails = {
    ...foundProduct,
    slug: foundProduct.slug || (foundProduct.id !== undefined ? String(foundProduct.id) : decodedSlug),
    category: foundProduct.category_slug || category,
    subcategory: foundProduct.subcategory_slug || subcategory
  };

  let reviewSummary = { count: 0, avg_rating: 0 };
  try {
    const reviewsData = await ApiService.getProductReviews(product.id, { published: true, limit: 1 });
    reviewSummary = reviewsData.summary || reviewSummary;
  } catch {
    reviewSummary = { count: 0, avg_rating: 0 };
  }

  let initialSchedule = null;
  try {
    const variantForSchedule =
      product.mainVariantId ??
      (product as any).main_variant_id ??
      (product.variants && product.variants.length > 0 ? product.variants[0].id : null);
    initialSchedule = await ApiService.getActiveSchedule(product.id, variantForSchedule);
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
            <Link href={`/${category}`} className="hover:text-green-600">
              {category
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <Link href={`/${category}/${subcategory}`} className="hover:text-green-600">
              {subcategory
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <ProductDetailsClient
        product={product}
        initialReviewSummary={reviewSummary}
        initialSchedule={initialSchedule}
      />
    </div>
  );
}
