"use client";

import CategoryCard from "@/components/home/CategoryCard";
import ProductCard from "@/components/common/ProductCard";
import LogoLoop from "@/components/common/LogoLoop";
import ShopAdvantages from "@/components/home/ShopAdvantages";
import { WobbleCard } from "@/components/ui/wobble-card";
import { useState, useEffect } from "react";
import { FaCarrot, FaAppleAlt, FaSeedling, FaPepperHot, FaMugHot } from "react-icons/fa";
import WelcomeSection from "@/components/home/WelcomeSection";
import MainCategories from "@/components/home/MainCategories";
import FAQ from "@/components/common/FAQ";
import ApiService from "@/lib/api";
import { readCache, writeCache } from "@/lib/storageCache";
import Link from "next/link";
import ReviewCardsSection, { PublicReview } from "@/components/reviews/ReviewCardsSection";

interface Product {
  id: number;
  title: string;
  imageUrl: string;
  discountPercentage: string;
  discountColor: string;
}

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

interface HeroSlide {
  id: number;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string | null;
}
interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  image_url?: string | null;
}

// Define the API response format
interface ApiHeroSlide {
  id: number;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  button_link?: string | null;
}

interface HomepageSectionItem {
  product_id?: number;
  variant_id?: number | null;
  product?: { id?: number };
}

export default function HeroSection() {
  const HOME_CACHE_KEY = "home:v3";
  const HOME_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

  const [active, setActive] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [topSellers, setTopSellers] = useState<CategoryProduct[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<CategoryProduct[]>([]);
  const [bestDealsProducts, setBestDealsProducts] = useState<CategoryProduct[]>([]);
  const [currentTrends, setCurrentTrends] = useState<TrendItem[]>([]);
  const [shopCategories, setShopCategories] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeferred, setShowDeferred] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [homeReviews, setHomeReviews] = useState<PublicReview[]>([]);
  
  useEffect(() => {
    const cached = readCache<{
      heroSlides: HeroSlide[];
      newArrivals: Product[];
      bestDeals: Product[];
      topSellers: CategoryProduct[];
      newArrivalsProducts: CategoryProduct[];
      bestDealsProducts: CategoryProduct[];
      currentTrends: TrendItem[];
      shopCategories: HomeCategory[];
    }>(HOME_CACHE_KEY);

    if (cached) {
      setHeroSlides(cached.heroSlides || []);
      setNewArrivals(cached.newArrivals || []);
      setBestDeals(cached.bestDeals || []);
      setTopSellers(cached.topSellers || []);
      setNewArrivalsProducts(cached.newArrivalsProducts || []);
      setBestDealsProducts(cached.bestDealsProducts || []);
      setCurrentTrends(cached.currentTrends || []);
      setShopCategories(cached.shopCategories || []);
      setLoading(false);
    }

    // Fetch data from backend API
    const fetchData = async () => {
      try {
        if (!cached) setLoading(true);
        setError(null);
        
        // Fetch hero slides from backend API
        const heroSlidesData = await ApiService.getHeroSlides();
        
        // Transform API response to match frontend format
        const transformedHeroSlides: HeroSlide[] = heroSlidesData.map((slide: any) => ({
          id: slide.id,
          imageUrl: slide.image_url || slide.imageUrl,
          mobileImageUrl: slide.mobile_image_url || slide.mobileImageUrl || null,
          linkUrl: slide.link_url || slide.button_link || slide.buttonLink || null
        }));
        
        // For other data, we'll keep using JSON files for now
        const [newArrivalsRes, bestDealsRes] = await Promise.all([
          fetch('/data/new-arrivals.json'),
          fetch('/data/best-deals.json')
        ]);
        
        if (!newArrivalsRes.ok || !bestDealsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [newArrivalsData, bestDealsData] = await Promise.all([
          newArrivalsRes.json(),
          bestDealsRes.json()
        ]);
        
        setHeroSlides(transformedHeroSlides);
        setNewArrivals(newArrivalsData);
        setBestDeals(bestDealsData);
        const trendsData = await ApiService.getTrends({ bypassCache: true });
        const transformedTrends: TrendItem[] = trendsData.map((trend: any) => ({
          id: trend.id,
          title: trend.title || '',
          subtitle: trend.description || '',
          imageUrl: trend.image_url || '',
          linkUrl: trend.link_url || trend.linkUrl || null,
          buttonText: 'Shop Now',
          cardType: 'wide',
          position: 'left'
        }));
        setCurrentTrends(transformedTrends);
        
        const categoriesData = await ApiService.getCategories({ bypassCache: true });
        setShopCategories(categoriesData || []);

        // Extract all products from categories
        const allProducts: CategoryProduct[] = [];
        categoriesData.forEach((category: any) => {
          category.subcategories.forEach((subcategory: any) => {
            if (subcategory.products && Array.isArray(subcategory.products)) {
              subcategory.products.forEach((product: any) => {
                const normalizedSlug =
                  product.slug ||
                  product.product_slug ||
                  (product.id !== undefined && product.id !== null ? String(product.id) : null);
                allProducts.push({
                  ...product,
                  mainVariantId: product.mainVariantId ?? product.main_variant_id ?? null,
                  category: category.slug,
                  subcategory: subcategory.slug,
                  slug: normalizedSlug || ""
                });
              });
            }
          });
        });
        
        console.log('Total products extracted:', allProducts.length);
        console.log('Sample products:', allProducts.slice(0, 3));
        
        console.log('Total products available:', allProducts.length);
        
        // Helper function to pick products consistently (no randomization)
        const pickConsistentProducts = (products: CategoryProduct[], count: number): CategoryProduct[] => {
          if (!products || products.length === 0) return [];
          if (products.length >= count) {
            // Enough products, take first 'count' items in order
            return products.slice(0, count);
          } else {
            // Not enough products, repeat the available products
            const result: CategoryProduct[] = [];
            for (let i = 0; i < count; i++) {
              const index = i % products.length;
              result.push(products[index]);
            }
            return result;
          }
        };
        
        const [topSection, bestSection, newSection] = await Promise.all([
          ApiService.getHomepageSection('top_seller'),
          ApiService.getHomepageSection('best_deal'),
          ApiService.getHomepageSection('new_arrivals')
        ]);
        const reviewsData = await ApiService.getPublicReviews({ limit: 6, offset: 0 });

        const productMap = new Map(allProducts.map((product) => [product.id, product]));
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
                (variant) => Number(variant?.id) === variantId
              );

              if (!matchedVariant) return baseProduct;

              return {
                ...baseProduct,
                price: Number(matchedVariant.price ?? baseProduct.price),
                originalPrice:
                  matchedVariant.originalPrice !== undefined && matchedVariant.originalPrice !== null
                    ? Number(matchedVariant.originalPrice)
                    : baseProduct.originalPrice,
                discountPercentage: matchedVariant.discountPercentage || baseProduct.discountPercentage,
                discountColor: matchedVariant.discountColor || baseProduct.discountColor,
                weight: matchedVariant.name || matchedVariant.type || baseProduct.weight,
                variants: [matchedVariant]
              } as CategoryProduct;
            })
            .filter(Boolean) as CategoryProduct[];
          return mapped;
        };

        const topSectionProducts = mapSectionProducts(topSection);
        const bestSectionProducts = mapSectionProducts(bestSection);
        const newSectionProducts = mapSectionProducts(newSection);

        // Select 6 products for each section consistently (fallback if section is empty)
        const nextTop = topSectionProducts.length ? topSectionProducts : pickConsistentProducts(allProducts, 6);
        const nextNew = newSectionProducts.length ? newSectionProducts : pickConsistentProducts(allProducts, 6);
        const nextBest = bestSectionProducts.length ? bestSectionProducts : pickConsistentProducts(allProducts, 6);

        setTopSellers(nextTop);
        setNewArrivalsProducts(nextNew);
        setBestDealsProducts(nextBest);
        setHomeReviews(reviewsData?.reviews || []);
        
        console.log('Top sellers count:', pickConsistentProducts(allProducts, 6).length);
        console.log('New arrivals count:', pickConsistentProducts(allProducts, 6).length);
        console.log('Best deals count:', pickConsistentProducts(allProducts, 6).length);
        
        writeCache(
          HOME_CACHE_KEY,
          {
            heroSlides: transformedHeroSlides,
            newArrivals: newArrivalsData,
            bestDeals: bestDealsData,
            topSellers: nextTop,
            newArrivalsProducts: nextNew,
            bestDealsProducts: nextBest,
            currentTrends: transformedTrends,
            shopCategories: categoriesData || []
          },
          HOME_CACHE_TTL
        );
      } catch (err) {
        console.error('Error fetching data:', err);
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const deferredTimer = setTimeout(() => setShowDeferred(true), 400);
    return () => clearTimeout(deferredTimer);
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (heroSlides.length === 0) return;

    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check on mount
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const showHeroSkeleton = loading && heroSlides.length === 0;

  return (
    <>
      {/* Error State */}
      {error && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* ================= HERO SECTION ================= */}
      <section className="w-full min-h-[70vh] sm:h-screen flex flex-col justify-center items-center bg-white fade-in">
        {showHeroSkeleton ? (
          <>
            <div className="relative w-[98%] h-[70vh] sm:h-[90%] mt-3 sm:mt-0 rounded-2xl sm:rounded-[28px] overflow-hidden skeleton" />
            <div className="mt-6 flex items-center gap-2">
              <div className="skeleton h-2 w-10 rounded-full" />
              <div className="skeleton h-2 w-2 rounded-full" />
              <div className="skeleton h-2 w-2 rounded-full" />
            </div>
          </>
        ) : (
          <>
            <div className="relative w-[98%] h-[70vh] sm:h-[90%] mt-3 sm:mt-0 rounded-2xl sm:rounded-[28px] overflow-hidden">
              {heroSlides.map((slide: HeroSlide, index: number) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === active ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {slide.linkUrl ? (
                    slide.linkUrl.startsWith("http") ? (
                      <a
                        href={slide.linkUrl}
                        className="block w-full h-full cursor-pointer"
                        rel="noreferrer"
                      >
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}')`
                          }}
                        />
                      </a>
                    ) : (
                      <Link href={slide.linkUrl} className="block w-full h-full cursor-pointer">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}')`
                          }}
                        />
                      </Link>
                    )
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}')`
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              {heroSlides.map((_: HeroSlide, index: number) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active === index ? "w-10 bg-gray-600" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ================= GAP ================= */}
      <div className="h-10 sm:h-14 md:h-24" />

      {/* ================= CATEGORY SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Shop By Category</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-1 md:gap-3">
            {(shopCategories.length > 0
              ? shopCategories
              : [
                  { id: 1, name: 'Vegetables', slug: 'vegetables' },
                  { id: 2, name: 'Fruits', slug: 'fruits' },
                  { id: 3, name: 'Grains', slug: 'grains' },
                  { id: 4, name: 'Spices', slug: 'spices' },
                  { id: 5, name: 'Tea', slug: 'tea' }
                ]
            ).map((category, index) => {
              const fallbackIcons = [
                <FaCarrot key="veg" className="w-12 h-12 text-white" />,
                <FaAppleAlt key="fruit" className="w-12 h-12 text-white" />,
                <FaSeedling key="grain" className="w-12 h-12 text-white" />,
                <FaPepperHot key="spice" className="w-12 h-12 text-white" />,
                <FaMugHot key="tea" className="w-12 h-12 text-white" />
              ];
              const fallbackColors = ['#9ca308', '#6b0f6b', '#007a4d', '#8b0000', '#1b0b4f'];
              return (
                <CategoryCard
                  key={category.id || category.slug}
                  title={category.name}
                  prefix=""
                  bgColor={fallbackColors[index % fallbackColors.length]}
                  icon={fallbackIcons[index % fallbackIcons.length]}
                  slug={category.slug}
                  imageUrl={(category as any).image || (category as any).image_url || null}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TOP SELLER SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Our Top Seller</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
            {topSellers.length > 0 ? (
              topSellers.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  imageUrl={product.imageUrl}
                  title={product.name}
                  weight={product.weight}
                  price={`€${product.price}`}
                  originalPrice={product.originalPrice ? `€${product.originalPrice}` : undefined}
                  rating={product.rating}
                  discountPercentage={product.discountPercentage}
                  discountColor={product.discountColor}
                  layout="grid"
                />
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= BEST DEALS SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Best Deals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
            {bestDealsProducts.length > 0 ? (
              bestDealsProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  imageUrl={product.imageUrl}
                  title={product.name}
                  weight={product.weight}
                  price={`€${product.price}`}
                  originalPrice={product.originalPrice ? `€${product.originalPrice}` : undefined}
                  rating={product.rating}
                  discountPercentage={product.discountPercentage}
                  discountColor={product.discountColor}
                  layout="grid"
                />
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= NEW ARRIVALS SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">New Arrivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-x-5 lg:gap-y-5">
            {newArrivalsProducts.length > 0 ? (
              newArrivalsProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  imageUrl={product.imageUrl}
                  title={product.name}
                  weight={product.weight}
                  price={`€${product.price}`}
                  originalPrice={product.originalPrice ? `€${product.originalPrice}` : undefined}
                  rating={product.rating}
                  discountPercentage={product.discountPercentage}
                  discountColor={product.discountColor}
                  layout="grid"
                />
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-10 sm:py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10">
          <h2 className="text-4xl font-bold mb-8 sm:mb-10 text-center text-black">Customer Reviews</h2>
          {homeReviews.length > 0 ? (
            <ReviewCardsSection reviews={homeReviews} mobileSlider={true} />
          ) : (
            <div className="text-center text-sm text-gray-600">No reviews yet.</div>
          )}
        </div>
      </section>

      <>
      {/* ================= CURRENT TRENDS SECTION ================= */}
      <section className="w-full py-10 sm:py-14 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Current offers</h2>
          
          <div className="space-y-6">
            {currentTrends.length > 0 ? (
              /* Render trends in fixed pairs - wide + narrow alternating per row */
              currentTrends.reduce((pairs: TrendItem[][], item: TrendItem, index: number) => {
                if (index % 2 === 0) {
                  pairs.push([item]);
                } else {
                  pairs[pairs.length - 1].push(item);
                }
                return pairs;
              }, []).map((pair, pairIndex) => {
                const wideFirst = pairIndex % 2 === 0;
                const first = pair[0];
                const second = pair[1] || null;

                const renderCard = (trend: TrendItem, isWide: boolean) => {
                  const spanClass = isWide ? 'md:col-span-2' : 'md:col-span-1';
                  const card = (
                    <WobbleCard 
                      key={trend.id} 
                      containerClassName={`h-64 overflow-hidden relative ${trend.linkUrl ? 'cursor-pointer' : ''}`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${trend.imageUrl}')`,
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-br from-black/95 via-black/70 to-transparent" />
                      <div className="absolute top-0 left-0 z-10 p-6">
                        <div className={isWide ? 'max-w-xs' : 'max-w-50'}>
                          <h2 className={`${isWide ? 'text-3xl' : 'text-xl'} font-bold text-white mb-2`}>
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
                  if (trend.linkUrl.startsWith('http')) {
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
                    <Link key={trend.id} href={trend.linkUrl} className={`block ${spanClass}`}>
                      {card}
                    </Link>
                  );
                };

                return (
                  <div key={pairIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {wideFirst
                      ? (
                        <>
                          {first && renderCard(first, true)}
                          {second ? renderCard(second, false) : <div className="hidden md:block md:col-span-1 h-64" />}
                        </>
                      )
                      : (
                        <>
                          {first && renderCard(first, false)}
                          {second ? renderCard(second, true) : <div className="hidden md:block md:col-span-2 h-64" />}
                        </>
                      )}
                  </div>
                );
              })
            ) : (
              /* Fallback loading state for trends */
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

      {/* ================= PARTNERSHIP BRANDS SECTION ================= */}
      <section className="w-full py-16 bg-white">
        {/* Top divider line */}
        <div className="w-full h-px bg-gray-300 mb-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Partnership Brands</h2>
          
          {/* Logo carousel - single line moving in loop */}
          <LogoLoop 
            logos={[
              '/brands/brahmins-logo.png',
              '/brands/britannia-logo.svg', 
              '/brands/chings-logo.png',
              '/brands/himalaya.png',
              '/brands/priya-logo.png',
              '/brands/apple.svg',
              '/brands/samsung.svg',
              '/brands/hitachi.svg',
              '/brands/parachute-logo.jpg',
              '/brands/fmod.svg'
            ]} 
            logoHeight="h-18"  // taller logos
            gap="mx-12"        // wider spacing
          />
        </div>
        
        {/* Bottom divider line */}
        <div className="w-full h-px bg-gray-300 mt-10"></div>
      </section>
      
      <ShopAdvantages />
      
      <section className="w-full border-black  py-10 bg-white">
        <WelcomeSection />
      </section>

      <section className="w-full border-black border-t  bg-gray-50  py-10">
        <MainCategories />
      </section>

      <section className=" border-black  py-10 bg-white">
        <FAQ />
      </section>
      </>
     
    </>
  );
}
