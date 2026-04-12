import CategoryCard from "@/components/home/CategoryCard";
import ProductCard from "@/components/common/ProductCard";
import LogoLoop from "@/components/common/LogoLoop";
import ShopAdvantages from "@/components/home/ShopAdvantages";
import { WobbleCard } from "@/components/ui/wobble-card";
import {
  FaCarrot,
  FaAppleAlt,
  FaSeedling,
  FaPepperHot,
  FaMugHot,
} from "react-icons/fa";
import WelcomeSection from "@/components/home/WelcomeSection";
import FAQ from "@/components/common/FAQ";
import ApiService from "@/lib/api";
import Link from "next/link";
import ReviewCardsSection, {
  PublicReview,
} from "@/components/reviews/ReviewCardsSection";
import HeroSlider, { HeroSlide } from "@/components/home/HeroSlider";

export const revalidate = 300;
export const metadata = {
  title: "Tulsi | Indian Grocery Store in Ghent",
  description:
    "Shop authentic Indian groceries in Ghent. Spices, grains, snacks, and daily essentials delivered fast with a friendly local experience.",
};

interface CategoryProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
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
  category: string;
  subcategory: string;
  slug: string;
  variants?: Array<{
    id?: number | string;
    name?: string | null;
    type?: string | null;
    price?: number | string;
    originalPrice?: number | string | null;
    discountPercentage?: string | null;
    discountColor?: string | null;
    stockQuantity?: number;
    sku?: string | null;
  }>;
}

interface TrendItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  cardType: "wide" | "narrow";
  position: "left" | "right";
  linkUrl?: string | null;
}

interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  image_url?: string | null;
  isSpecial?: boolean;
}

interface HomepageSectionItem {
  product_id?: number;
  variant_id?: number | null;
  product?: { id?: number };
}

interface HomepageSectionDef {
  id: number;
  section_key: string;
  title: string;
  subtitle?: string | null;
  type: "products" | "banner";
  image_url?: string | null;
  link_url?: string | null;
  cta_label?: string | null;
  card_size?: "wide" | "narrow" | null;
  sort_order?: number;
  is_active?: boolean;
}

export default async function HomePage() {
  const bypassHomeCache = process.env.NODE_ENV !== "production";
  const [
    heroSlidesData,
    trendsData,
    categoriesData,
    sectionDefsData,
    topSection,
    bestSection,
    newSection,
    reviewsData,
    settingsData,
  ] = await Promise.all([
    ApiService.getHeroSlides(),
    ApiService.getTrends(),
    ApiService.getCategories(),
    ApiService.getHomepageSectionDefs({ bypassCache: bypassHomeCache }),
    ApiService.getHomepageSection("top_seller"),
    ApiService.getHomepageSection("best_deal"),
    ApiService.getHomepageSection("new_arrivals"),
    ApiService.getPublicReviews({ limit: 9, offset: 0 }),
    ApiService.getSettings(),
  ]);

  const transformedHeroSlides: HeroSlide[] = (heroSlidesData || []).map(
    (slide: any) => ({
      id: slide.id,
      imageUrl: slide.image_url || slide.imageUrl,
      mobileImageUrl: slide.mobile_image_url || slide.mobileImageUrl || null,
      linkUrl: slide.link_url || slide.button_link || slide.buttonLink || null,
    }),
  );

  const transformedTrends: TrendItem[] = (trendsData || []).map(
    (trend: any) => ({
      id: trend.id,
      title: trend.title || "",
      subtitle: trend.description || "",
      imageUrl: trend.image_url || "",
      linkUrl: trend.link_url || trend.linkUrl || null,
      buttonText: "Shop Now",
      cardType: "wide",
      position: "left",
    }),
  );

  const shopCategories = (categoriesData || []) as HomeCategory[];
  const specialCategories = (await ApiService.getSpecialCategories()) as HomeCategory[];
  const mergedCategories: HomeCategory[] = [
    ...shopCategories.map((category): HomeCategory => ({ ...category, isSpecial: false })),
    ...((specialCategories || []).map((category): HomeCategory => ({ ...category, isSpecial: true })))
  ];

  const allProducts: CategoryProduct[] = [];
  (categoriesData || []).forEach((category: any) => {
    category.subcategories?.forEach((subcategory: any) => {
      if (subcategory.products && Array.isArray(subcategory.products)) {
        subcategory.products.forEach((product: any) => {
          const normalizedSlug =
            product.slug ||
            product.product_slug ||
            (product.id !== undefined && product.id !== null
              ? String(product.id)
              : null);
          allProducts.push({
            ...product,
            mainVariantId:
              product.mainVariantId ?? product.main_variant_id ?? null,
            category: category.slug,
            subcategory: subcategory.slug,
            slug: normalizedSlug || "",
          });
        });
      }
    });
  });

  const pickConsistentProducts = (
    products: CategoryProduct[],
    count: number,
  ): CategoryProduct[] => {
    if (!products || products.length === 0) return [];
    if (products.length >= count) {
      return products.slice(0, count);
    }
    const result: CategoryProduct[] = [];
    for (let i = 0; i < count; i++) {
      const index = i % products.length;
      result.push(products[index]);
    }
    return result;
  };

  const productMap = new Map(
    allProducts.map((product) => [product.id, product]),
  );
  const mapSectionProducts = (items: HomepageSectionItem[]) => {
    const mapped = items
      .map((item) => {
        const productId = item?.product_id || item?.product?.id;
        if (productId === undefined || productId === null) return null;
        const baseProduct = productMap.get(productId);
        if (!baseProduct) return null;

        const variantId =
          item?.variant_id !== undefined && item?.variant_id !== null
            ? Number(item.variant_id)
            : null;

        if (variantId === null || Number.isNaN(variantId)) {
          return baseProduct;
        }

        const matchedVariant = (baseProduct.variants || []).find(
          (variant) => Number(variant?.id) === variantId,
        );

        if (!matchedVariant) return baseProduct;

        return {
          ...baseProduct,
          price: Number(matchedVariant.price ?? baseProduct.price),
          originalPrice:
            matchedVariant.originalPrice !== undefined &&
            matchedVariant.originalPrice !== null
              ? Number(matchedVariant.originalPrice)
              : baseProduct.originalPrice,
          discountPercentage:
            matchedVariant.discountPercentage || baseProduct.discountPercentage,
          discountColor:
            matchedVariant.discountColor || baseProduct.discountColor,
          weight:
            matchedVariant.name || matchedVariant.type || baseProduct.weight,
          variants: [matchedVariant],
        } as CategoryProduct;
      })
      .filter(Boolean) as CategoryProduct[];
    return mapped;
  };

  const rawDefs = (sectionDefsData || []) as HomepageSectionDef[];
  const activeDefs = rawDefs
    .filter((def) => def && def.is_active !== false)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const hasDynamicDefs = activeDefs.length > 0;

  const fallbackDefs: HomepageSectionDef[] = [
    {
      id: 1,
      section_key: "top_seller",
      title: "Our Top Seller",
      type: "products",
    },
    { id: 2, section_key: "best_deal", title: "Best Deals", type: "products" },
    {
      id: 3,
      section_key: "new_arrivals",
      title: "New Arrivals",
      type: "products",
    },
  ];

  const sectionDefs = hasDynamicDefs ? activeDefs : fallbackDefs;

  const productDefs = sectionDefs.filter((def) => def.type === "products");
  const bannerDefs = sectionDefs.filter((def) => def.type === "banner");

  const sectionItemsByKey: Record<string, HomepageSectionItem[]> = {};
  if (hasDynamicDefs) {
    const responses = await Promise.all(
      productDefs.map((def) => ApiService.getHomepageSection(def.section_key)),
    );
    productDefs.forEach((def, index) => {
      sectionItemsByKey[def.section_key] = responses[index] || [];
    });
  } else {
    sectionItemsByKey["top_seller"] = topSection || [];
    sectionItemsByKey["best_deal"] = bestSection || [];
    sectionItemsByKey["new_arrivals"] = newSection || [];
  }

  const sectionProductsByKey: Record<string, CategoryProduct[]> = {};
  productDefs.forEach((def) => {
    const items = sectionItemsByKey[def.section_key] || [];
    const mapped = mapSectionProducts(items);
    sectionProductsByKey[def.section_key] = mapped.length
      ? mapped
      : pickConsistentProducts(allProducts, 6);
  });

  const homeReviews: PublicReview[] = reviewsData?.reviews || [];

  const heroHeadlineEnabled = Boolean(settingsData?.home_hero_text_enabled);
  const heroHeadlineText = String(settingsData?.home_hero_h1_text || "").trim();

  return (
    <div className="bg-white">
      {heroHeadlineEnabled && heroHeadlineText ? (
        <h1 className="text-sm sm:text-base lg:text-lg text-center w-full p-5 font-semibold text-green-900">
          {heroHeadlineText}
        </h1>
      ) : null}
      {/* ================= HERO SECTION ================= */}
      <HeroSlider slides={transformedHeroSlides} />

      {/* ================= GAP ================= */}
      <div className="h-10 sm:h-14 md:h-24 bg-white" />

      {/* ================= CATEGORY SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">
            Shop By Category
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-1 md:gap-3">
            {(mergedCategories.length > 0
              ? mergedCategories
              : [
                  { id: 1, name: "Vegetables", slug: "vegetables" },
                  { id: 2, name: "Fruits", slug: "fruits" },
                  { id: 3, name: "Grains", slug: "grains" },
                  { id: 4, name: "Spices", slug: "spices" },
                  { id: 5, name: "Tea", slug: "tea" },
                ]
            ).map((category, index) => {
              const fallbackIcons = [
                <FaCarrot key="veg" className="w-12 h-12 text-white" />,
                <FaAppleAlt key="fruit" className="w-12 h-12 text-white" />,
                <FaSeedling key="grain" className="w-12 h-12 text-white" />,
                <FaPepperHot key="spice" className="w-12 h-12 text-white" />,
                <FaMugHot key="tea" className="w-12 h-12 text-white" />,
              ];
              const fallbackColors = [
                "#9ca308",
                "#6b0f6b",
                "#007a4d",
                "#8b0000",
                "#1b0b4f",
              ];
              return (
                <CategoryCard
                  key={`${category.isSpecial ? "special" : "category"}-${category.id || category.slug}`}
                  title={category.name}
                  prefix=""
                  bgColor={fallbackColors[index % fallbackColors.length]}
                  icon={fallbackIcons[index % fallbackIcons.length]}
                  slug={category.slug}
                  href={category.isSpecial ? `/special/${category.slug}` : `/${category.slug}`}
                  imageUrl={
                    (category as any).image ||
                    (category as any).image_url ||
                    null
                  }
                />
              );
            })}
          </div>
        </div>
      </section>

      {hasDynamicDefs ? (
        <>
          {/* ================= DYNAMIC HOMEPAGE SECTIONS ================= */}
          {false ? (
            <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 space-y-6">
                {bannerDefs.map((def) => {
                  const card = (
                    <WobbleCard
                      key={def.section_key}
                      containerClassName={`h-64 overflow-hidden relative ${def.link_url ? "cursor-pointer" : ""}`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${def.image_url || ""}')`,
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/70 to-transparent" />
                      <div className="absolute top-0 left-0 z-10 p-6">
                        <div className="max-w-lg">
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {def.title}
                          </h2>
                          {def.subtitle ? (
                            <p className="text-slate-200 text-sm mb-3">
                              {def.subtitle}
                            </p>
                          ) : null}
                          {def.cta_label ? (
                            <div className="inline-block text-white text-sm font-semibold underline">
                              {def.cta_label}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </WobbleCard>
                  );

                  if (!def.link_url)
                    return <div key={def.section_key}>{card}</div>;
                  if (def.link_url.startsWith("http")) {
                    return (
                      <a
                        key={def.section_key}
                        href={def.link_url}
                        rel="noreferrer"
                        className="block"
                      >
                        {card}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={def.section_key}
                      href={def.link_url}
                      className="block"
                    >
                      {card}
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          {false
            ? productDefs.map((def) => {
                const products = sectionProductsByKey[def.section_key] || [];
                return (
                  <section
                    key={def.section_key}
                    className="w-full py-10 sm:py-14 md:py-20 bg-white"
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
                      <h2 className="text-4xl font-bold mb-10 text-center text-black">
                        {def.title}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
                        {products.length > 0
                          ? products.map((product, index) => (
                              <ProductCard
                                key={`${def.section_key}:${product.id}-${index}`}
                                product={product}
                                size="compact"
                                titleClassName="line-clamp-2"
                                imageUrl={product.imageUrl}
                                title={product.name}
                                weight={product.weight}
                                price={`â‚¬${product.price}`}
                                originalPrice={
                                  product.originalPrice
                                    ? `â‚¬${product.originalPrice}`
                                    : undefined
                                }
                                rating={product.rating}
                                discountPercentage={product.discountPercentage}
                                discountColor={product.discountColor}
                                layout="grid"
                              />
                            ))
                          : Array.from({ length: 10 }).map((_, index) => (
                              <div
                                key={index}
                                className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse"
                              />
                            ))}
                      </div>
                    </div>
                  </section>
                );
              })
            : null}

          {sectionDefs.map((def) => {
            if (def.type === "banner") {
              const card = (
                <WobbleCard
                  key={def.section_key}
                  containerClassName={`h-64 overflow-hidden relative ${def.link_url ? "cursor-pointer" : ""}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${def.image_url || ""}')` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/70 to-transparent" />
                  <div className="absolute top-0 left-0 z-10 p-6">
                    <div className="max-w-lg">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {def.title}
                      </h2>
                      {def.subtitle ? (
                        <p className="text-slate-200 text-sm mb-3">
                          {def.subtitle}
                        </p>
                      ) : null}
                      {def.cta_label ? (
                        <div className="inline-block text-white text-sm font-semibold underline">
                          {def.cta_label}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </WobbleCard>
              );

              const wrappedCard = !def.link_url ? (
                <div>{card}</div>
              ) : def.link_url.startsWith("http") ? (
                <a href={def.link_url} rel="noreferrer" className="block">
                  {card}
                </a>
              ) : (
                <Link href={def.link_url} className="block">
                  {card}
                </Link>
              );

              return (
                <section
                  key={def.section_key}
                  className="w-full py-10 sm:py-14 md:py-20 bg-white"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
                    {wrappedCard}
                  </div>
                </section>
              );
            }

            const products = sectionProductsByKey[def.section_key] || [];
            return (
              <section
                key={def.section_key}
                className="w-full py-10 sm:py-14 md:py-20 bg-white"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
                  <h2 className="text-4xl font-bold mb-10 text-center text-black">
                    {def.title}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
                    {products.length > 0
                      ? products.map((product, index) => (
                          <ProductCard
                            key={`${def.section_key}:${product.id}-${index}`}
                            product={product}
                            size="compact"
                            titleClassName="line-clamp-2"
                            imageUrl={product.imageUrl}
                            title={product.name}
                            weight={product.weight}
                            price={`€${product.price}`}
                            originalPrice={
                              product.originalPrice
                                ? `€${product.originalPrice}`
                                : undefined
                            }
                            rating={product.rating}
                            discountPercentage={product.discountPercentage}
                            discountColor={product.discountColor}
                            layout="grid"
                          />
                        ))
                      : Array.from({ length: 10 }).map((_, index) => (
                          <div
                            key={index}
                            className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse"
                          />
                        ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      ) : null}

      {/* ================= TOP SELLER SECTION ================= */}
      {!hasDynamicDefs ? (
        <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            <h2 className="text-4xl font-bold mb-10 text-center text-black">
              Our Top Seller
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
              {(sectionProductsByKey["top_seller"] || []).length > 0
                ? (sectionProductsByKey["top_seller"] || []).map(
                    (product, index) => (
                      <ProductCard
                        key={`${product.id}-${index}`}
                        product={product}
                        size="compact"
                        titleClassName="line-clamp-2"
                        imageUrl={product.imageUrl}
                        title={product.name}
                        weight={product.weight}
                        price={`€${product.price}`}
                        originalPrice={
                          product.originalPrice
                            ? `€${product.originalPrice}`
                            : undefined
                        }
                        rating={product.rating}
                        discountPercentage={product.discountPercentage}
                        discountColor={product.discountColor}
                        layout="grid"
                      />
                    ),
                  )
                : Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= BEST DEALS SECTION ================= */}
      {!hasDynamicDefs ? (
        <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            <h2 className="text-4xl font-bold mb-10 text-center text-black">
              Best Deals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
              {(sectionProductsByKey["best_deal"] || []).length > 0
                ? (sectionProductsByKey["best_deal"] || []).map(
                    (product, index) => (
                      <ProductCard
                        key={`${product.id}-${index}`}
                        product={product}
                        size="compact"
                        titleClassName="line-clamp-2"
                        imageUrl={product.imageUrl}
                        title={product.name}
                        weight={product.weight}
                        price={`€${product.price}`}
                        originalPrice={
                          product.originalPrice
                            ? `€${product.originalPrice}`
                            : undefined
                        }
                        rating={product.rating}
                        discountPercentage={product.discountPercentage}
                        discountColor={product.discountColor}
                        layout="grid"
                      />
                    ),
                  )
                : Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= NEW ARRIVALS SECTION ================= */}
      {!hasDynamicDefs ? (
        <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
            <h2 className="text-4xl font-bold mb-10 text-center text-black">
              New Arrivals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
              {(sectionProductsByKey["new_arrivals"] || []).length > 0
                ? (sectionProductsByKey["new_arrivals"] || []).map(
                    (product, index) => (
                      <ProductCard
                        key={`${product.id}-${index}`}
                        product={product}
                        size="compact"
                        titleClassName="line-clamp-2"
                        imageUrl={product.imageUrl}
                        title={product.name}
                        weight={product.weight}
                        price={`€${product.price}`}
                        originalPrice={
                          product.originalPrice
                            ? `€${product.originalPrice}`
                            : undefined
                        }
                        rating={product.rating}
                        discountPercentage={product.discountPercentage}
                        discountColor={product.discountColor}
                        layout="grid"
                      />
                    ),
                  )
                : Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse"
                    />
                  ))}
            </div>
          </div>
        </section>
      ) : null}

      <>
        {/* ================= CURRENT TRENDS SECTION ================= */}
        <section className="w-full py-10 sm:py-14 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-10 text-center text-black">
              Current offers
            </h2>

            <div className="space-y-6">
              {transformedTrends.length > 0 ? (
                transformedTrends
                  .reduce(
                    (pairs: TrendItem[][], item: TrendItem, index: number) => {
                      if (index % 2 === 0) {
                        pairs.push([item]);
                      } else {
                        pairs[pairs.length - 1].push(item);
                      }
                      return pairs;
                    },
                    [],
                  )
                  .map((pair, pairIndex) => {
                    const wideFirst = pairIndex % 2 === 0;
                    const first = pair[0];
                    const second = pair[1] || null;

                    const renderCard = (trend: TrendItem, isWide: boolean) => {
                      const spanClass = isWide
                        ? "md:col-span-2"
                        : "md:col-span-1";
                      const card = (
                        <WobbleCard
                          key={trend.id}
                          containerClassName={`h-64 overflow-hidden relative ${
                            trend.linkUrl ? "cursor-pointer" : ""
                          }`}
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: `url('${trend.imageUrl}')`,
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/70 to-transparent" />
                          <div className="absolute top-0 left-0 z-10 p-6">
                            <div className={isWide ? "max-w-xs" : "max-w-50"}>
                              <h2
                                className={`${
                                  isWide ? "text-3xl" : "text-xl"
                                } font-bold text-white mb-2`}
                              >
                                {trend.title}
                              </h2>
                              <p className="text-slate-200 text-sm mb-3">
                                {trend.subtitle}
                              </p>
                            </div>
                          </div>
                        </WobbleCard>
                      );
                      if (!trend.linkUrl) {
                        return (
                          <div key={trend.id} className={spanClass}>
                            {card}
                          </div>
                        );
                      }
                      if (trend.linkUrl.startsWith("http")) {
                        return (
                          <a
                            key={trend.id}
                            href={trend.linkUrl}
                            rel="noreferrer"
                            className={`block ${spanClass}`}
                          >
                            {card}
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={trend.id}
                          href={trend.linkUrl}
                          className={`block ${spanClass}`}
                        >
                          {card}
                        </Link>
                      );
                    };

                    return (
                      <div
                        key={pairIndex}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      >
                        {wideFirst ? (
                          <>
                            {first && renderCard(first, true)}
                            {second ? (
                              renderCard(second, false)
                            ) : (
                              <div className="hidden md:block md:col-span-1 h-64" />
                            )}
                          </>
                        ) : (
                          <>
                            {first && renderCard(first, false)}
                            {second ? (
                              renderCard(second, true)
                            ) : (
                              <div className="hidden md:block md:col-span-2 h-64" />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-64 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="md:col-span-1 h-64 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 h-64 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="md:col-span-2 h-64 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-10 sm:py-14 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
            <h2 className="text-4xl font-bold mb-8 sm:mb-10 text-center text-black">
              Customer Reviews
            </h2>
            {homeReviews.length > 0 ? (
              <ReviewCardsSection reviews={homeReviews} mobileSlider={true} />
            ) : (
              <div className="text-center text-sm text-gray-600">
                No reviews yet.
              </div>
            )}
            <div className="mt-6 sm:mt-8 text-center">
              <Link
                href="/reviews"
                className="inline-flex items-center justify-center rounded-lg bg-[#266000] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4f00] transition-colors"
              >
                View All Reviews
              </Link>
            </div>
          </div>
        </section>

        {/* ================= PARTNERSHIP BRANDS SECTION ================= */}
        <section className="w-full py-16 bg-white">
          <div className="w-full h-px bg-gray-300 mb-10"></div>

          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-10 text-center text-black">
              Partnership Brands
            </h2>

            <LogoLoop
              logos={[
                "/brands/brahmins-logo.png",
                "/brands/britannia-logo.svg",
                "/brands/chings-logo.png",
                "/brands/himalaya.png",
                "/brands/priya-logo.png",
                "/brands/maggie.png",
                "/brands/logo.png",
                "/brands/Annam.png",
                "/brands/parachute-logo.jpg",
              ]}
              logoHeight="h-18"
              gap="mx-12"
            />
          </div>

          <div className="w-full h-px bg-gray-300 mt-10"></div>
        </section>

        <ShopAdvantages />

        <section className="w-full border-black  py-10 bg-white">
          <WelcomeSection />
        </section>

        <section className=" border-black  py-10 bg-white">
          <FAQ />
        </section>
      </>
    </div>
  );
}
