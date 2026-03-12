"use client";

import CategoryCard from "@/components/home/CategoryCard";
import ProductCard from "@/components/common/ProductCard";
import LogoLoop from "@/components/common/LogoLoop";
import ShopAdvantages from "@/components/home/ShopAdvantages";
import { WobbleCard } from "@/components/ui/wobble-card";
import { useState, useRef, RefObject, useEffect } from "react";
import { ChevronLeft, ChevronRight, Section } from "lucide-react";
import { FaCarrot, FaAppleAlt, FaSeedling, FaPepperHot, FaMugHot } from "react-icons/fa";
import WelcomeSection from "@/components/home/WelcomeSection";
import MainCategories from "@/components/home/MainCategories";
import FAQ from "@/components/common/FAQ";
import ApiService from "@/lib/api";
import { readCache, writeCache } from "@/lib/storageCache";

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
}

interface TrendItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  cardType: "wide" | "narrow";
  position: "left" | "right";
}

interface HeroSlide {
  id: number;
  imageUrl: string;
  mobileImageUrl?: string;
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
}

export default function HeroSection() {
  const HOME_CACHE_KEY = "home:v1";
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
  const categoryRef = useRef<HTMLDivElement>(null);
  const topSellerRef = useRef<HTMLDivElement>(null);
  const bestDealsRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  
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
          mobileImageUrl: slide.mobile_image_url || slide.mobileImageUrl || null
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
        const trendsData = await ApiService.getTrends();
        const transformedTrends: TrendItem[] = trendsData.map((trend: any, index: number) => ({
          id: trend.id,
          title: trend.title || '',
          subtitle: trend.description || '',
          imageUrl: trend.image_url || '',
          buttonText: 'Shop Now',
          cardType: index % 2 === 0 ? 'wide' : 'narrow',
          position: index % 2 === 0 ? 'left' : 'right'
        }));
        setCurrentTrends(transformedTrends);
        
        const categoriesData = await ApiService.getCategories();
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

        const productMap = new Map(allProducts.map((product) => [product.id, product]));
        const mapSectionProducts = (items: any[]) => {
          const mapped = items
            .map((item) => {
              const productId = item?.product_id || item?.product?.id;
              return productMap.get(productId);
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

    // Reset carousels to start when screen size changes to mobile
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
        if (window.innerWidth < 640) {
          // Reset all carousels to start position on mobile
          if (categoryRef.current) categoryRef.current.scrollTo({ left: 0 });
          if (topSellerRef.current) topSellerRef.current.scrollTo({ left: 0 });
          if (bestDealsRef.current) bestDealsRef.current.scrollTo({ left: 0 });
        if (newArrivalsRef.current) newArrivalsRef.current.scrollTo({ left: 0 });
      }
    };

    // Check on mount
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    if (!ref.current) return;
    const cardWidth = window.innerWidth < 640 ? 210 : 300; // approx ProductCard width + gap
    ref.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };
  
  const scrollTopSeller = (dir: "left" | "right") => {
    if (!topSellerRef.current) return;
    // Reset to start on small screens, scroll normally on larger screens
    const cardWidth = window.innerWidth < 640 ? 210 : 300; // approx ProductCard width + gap
    topSellerRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };
  
  const scrollBestDeals = (dir: "left" | "right") => {
    if (!bestDealsRef.current) return;
    // Reset to start on small screens, scroll normally on larger screens
    const cardWidth = window.innerWidth < 640 ? 210 : 300; // approx ProductCard width + gap
    bestDealsRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };
  
  const scrollCategories = (dir: "left" | "right") => {
    if (!categoryRef.current) return;
    // Reset to start on small screens, scroll normally on larger screens
    const cardWidth = window.innerWidth < 640 ? 210 : 300; // approx CategoryCard width + gap
    categoryRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };
  
  const scrollNewArrivals = (dir: "left" | "right") => {
    if (!newArrivalsRef.current) return;
    // Reset to start on small screens, scroll normally on larger screens
    const cardWidth = window.innerWidth < 640 ? 210 : 300; // approx ProductCard width + gap
    newArrivalsRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="w-full h-screen flex flex-col justify-center items-center bg-white">
          <div className="relative w-[98%] h-[90%] mt-3 sm:mt-0 rounded-[16px] sm:rounded-[28px] overflow-hidden skeleton" />
          <div className="mt-6 flex items-center gap-2">
            <div className="skeleton h-2 w-10 rounded-full" />
            <div className="skeleton h-2 w-2 rounded-full" />
            <div className="skeleton h-2 w-2 rounded-full" />
          </div>
        </section>

        <div className="h-24" />

        <section className="w-full py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="skeleton h-10 w-1/3 mx-auto mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="skeleton w-full aspect-square rounded-xl mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

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
          <div className="relative w-[98%] h-[70vh] sm:h-[90%] mt-3 sm:mt-0 rounded-2xl sm:rounded-[28px] overflow-hidden">
          {heroSlides.map((slide: HeroSlide, index: number) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === active
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl}')` }}
                />
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
      </section>

      {/* ================= GAP ================= */}
      <div className="h-24" />

      {/* ================= CATEGORY SECTION ================= */}
      <section className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Shop By Category</h2>

          <div className="relative">
            <button
              onClick={() => scrollCategories("left")}
              className="absolute -left-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft />
            </button>

            <div
              ref={categoryRef}
              className="overflow-x-scroll pb-4 scrollbar-hide flex justify-start sm:justify-center"
            >
              <div className="flex gap-4 sm:gap-6 min-w-max">
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

            <button
              onClick={() => scrollCategories("right")}
              className="absolute -right-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ================= TOP SELLER SECTION ================= */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Our Top Seller</h2>

          <div className="relative">
            <button
              onClick={() => scrollTopSeller("left")}
              className="absolute -left-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft />
            </button>

            <div
              ref={topSellerRef}
              className="overflow-x-scroll pb-4 scrollbar-hide flex justify-start sm:justify-center"
            >
              <div className="flex gap-4 sm:gap-6 min-w-max">
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
                      layout="carousel"
                    />
                  ))
                ) : (
                  // Fallback content while loading
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-72 h-80 bg-gray-200 rounded-xl animate-pulse" />
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => scrollTopSeller("right")}
              className="absolute -right-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ================= BEST DEALS SECTION ================= */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Best Deals</h2>

          <div className="relative">
            <button
              onClick={() => scrollBestDeals("left")}
              className="absolute -left-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft />
            </button>

            <div
              ref={bestDealsRef}
              className="overflow-x-scroll pb-4 scrollbar-hide flex justify-start sm:justify-center"
            >
              <div className="flex gap-4 sm:gap-6 min-w-max">
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
                      layout="carousel"
                    />
                  ))
                ) : (
                  // Fallback content while loading
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-72 h-80 bg-gray-200 rounded-xl animate-pulse" />
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => scrollBestDeals("right")}
              className="absolute -right-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* ================= NEW ARRIVALS SECTION ================= */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">New Arrivals</h2>

          <div className="relative">
            <button
              onClick={() => scrollNewArrivals("left")}
              className="absolute -left-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft />
            </button>

            <div
              ref={newArrivalsRef}
              className="overflow-x-scroll pb-4 scrollbar-hide flex justify-start sm:justify-center"
            >
              <div className="flex gap-4 sm:gap-6 min-w-max">
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
                      layout="carousel"
                    />
                  ))
                ) : (
                  // Fallback content while loading
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="w-72 h-80 bg-gray-200 rounded-xl animate-pulse" />
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => scrollNewArrivals("right")}
              className="absolute -right-6 z-10 bg-white shadow-md rounded-full p-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>

      {showDeferred && (
      <>
      {/* ================= CURRENT TRENDS SECTION ================= */}
      <section className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-10 text-center text-black">Current Trends</h2>
          
          <div className="space-y-6">
            {currentTrends.length > 0 ? (
              /* Render trends in pairs - wide/narrow alternating */
              currentTrends.reduce((pairs: TrendItem[][], item: TrendItem, index: number) => {
                if (index % 2 === 0) {
                  pairs.push([item]);
                } else {
                  pairs[pairs.length - 1].push(item);
                }
                return pairs;
              }, []).map((pair, pairIndex) => (
                <div key={pairIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pair.map((trend) => (
                    <WobbleCard 
                      key={trend.id} 
                      containerClassName={`${trend.cardType === 'wide' ? 'md:col-span-2' : 'md:col-span-1'} h-64 overflow-hidden relative`}
                    >
                      {/* FULL IMAGE */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${trend.imageUrl}')`,
                        }}
                      />
                      
                      {/* DARKER DIAGONAL GRADIENT */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/70 to-transparent" />
                      
                      {/* CONTENT - True Top Left Corner */}
                      <div className="absolute top-0 left-0 z-10 p-6">
                        <div className={trend.cardType === 'wide' ? 'max-w-xs' : 'max-w-[200px]'}>
                          <h2 className={`${trend.cardType === 'wide' ? 'text-3xl' : 'text-xl'} font-bold text-white mb-2`}>
                            {trend.title}
                          </h2>
                          <p className="text-slate-200 text-sm mb-3">
                            {trend.subtitle}
                          </p>
                          <button className="bg-white text-green-800 px-4 py-2 rounded-lg font-medium">
                            {trend.buttonText}
                          </button>
                        </div>
                      </div>
                    </WobbleCard>
                  ))}
                </div>
              ))
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

      <section className="w-full border-black border-t-1  bg-gray-50  py-10">
        <MainCategories />
      </section>

      <section className=" border-black  py-10 bg-white">
        <FAQ />
      </section>
      </>
      )}
     
    </>
  );
}
