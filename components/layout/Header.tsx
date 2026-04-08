'use client';

import { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, User, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import SearchSuggestions from '@/components/SearchSuggestions';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MobileMenu from '@/components/layout/MobileMenu';
import ApiService from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  discountPercentage?: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  origin: string;
  slug?: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
  isSpecial?: boolean;
}

export default function Header() {
  const getApiCache = <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(`tulsi_cache:api:${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.expiresAt !== 'number') return null;
      if (Date.now() > parsed.expiresAt) return null;
      return parsed.data ?? null;
    } catch {
      return null;
    }
  };

  const [showAll, setShowAll] = useState(false);
  const [columnsPerRow, setColumnsPerRow] = useState(6);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specialCategories, setSpecialCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [deliveryLocation, setDeliveryLocation] = useState('Belgium');
  
  const { getTotalItems } = useCart();
  const { user: authUser } = useAuth();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: Category[] = await ApiService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    const cached = getApiCache<Category[]>('categories');
    if (cached && cached.length > 0) {
      setCategories(cached);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const [cats, subs] = await Promise.all([
          ApiService.getSpecialCategories(),
          ApiService.getSpecialSubcategories("all")
        ]);
        const subByCat: Record<string, Subcategory[]> = {};
        (subs || []).forEach((sub: any) => {
          const catId = String(sub.category_id ?? sub.categoryId ?? "");
          if (!catId) return;
          if (!subByCat[catId]) subByCat[catId] = [];
          subByCat[catId].push({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            image: sub.image_url || sub.imageUrl
          } as Subcategory);
        });
        const mapped = (cats || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image || cat.image_url || undefined,
          subcategories: subByCat[String(cat.id)] || [],
          isSpecial: true
        }));
        setSpecialCategories(mapped);
      } catch (error) {
        console.error('Error fetching special categories:', error);
      }
    };
    fetchSpecials();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await ApiService.getSettings();
        if (settings?.logo_url) {
          setLogoUrl(settings.logo_url);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const data = await ApiService.getAnnouncementBar();
      if (data) {
        setAnnouncement(data);
      }
    };

    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const loadDeliveryLocation = async () => {
      if (!authUser) {
        setDeliveryLocation('Belgium');
        return;
      }
      try {
        const profile = await ApiService.getCustomerProfile(authUser.id);
        if (!profile?.id) return;
        const addresses = await ApiService.getCustomerAddresses(profile.id);
        const list = Array.isArray(addresses) ? addresses : [];
        const preferred = list.find((addr: any) => addr.is_default) || list[0];
        if (preferred) {
          const city = preferred.city || '';
          const country = preferred.country || '';
          const label = [city, country].filter(Boolean).join(', ');
          if (label) setDeliveryLocation(label);
        }
      } catch (error) {
        // keep fallback if request fails
      }
    };

    loadDeliveryLocation();
  }, [authUser]);

  const itemsPerRow = columnsPerRow;
  const navCategories: Category[] = [...specialCategories, ...categories];
  const totalRows = Math.ceil(navCategories.length / itemsPerRow);
  const displayedCategories: Category[] = showAll ? navCategories : navCategories.slice(0, itemsPerRow * 2);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumnsPerRow(3);
      else if (window.innerWidth < 768) setColumnsPerRow(4);
      else if (window.innerWidth < 1024) setColumnsPerRow(5);
      else setColumnsPerRow(6);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return;
    setOpenDropdown(slug);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Show suggestions when typing
    setShowSuggestions(value.length > 0);
  };

  return (
    <>
      <div className="w-full font-sans">
        {announcement?.is_active !== false && (announcement?.message || '🚚 Fast delivery in Ghent | Authentic Indian groceries | Fresh products available every weekend') && (
          <div className="announcement-bar" style={{ backgroundColor: '#173A00' }}>
            <div
              className="announcement-marquee"
              style={{ ['--marquee-duration' as any]: `${announcement?.speed || 20}s` }}
            >
              <div className="announcement-track">
                {[0, 1].map((groupIdx) => (
                  <div className="announcement-group" key={groupIdx}>
                    {[0, 1, 2, 3].map((idx) => (
                      <div className="announcement-item" key={`${groupIdx}-${idx}`}>
                        <span>{announcement?.message || '🚚 Fast delivery in Ghent | Authentic Indian groceries | Fresh products available every weekend'}</span>
                        {announcement?.link_url && announcement?.link_text && (
                          <a href={announcement.link_url} className="announcement-link">
                            {announcement.link_text}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-b">
          {/* Desktop Layout */}
          <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-5 items-center gap-10 relative">
            <Link href="/" className="flex items-center">
              <img 
                src={logoUrl || "/logo/logo.jpeg"} 
                alt="Fmod Logo" 
                className="h-15 w-auto"
                onError={(e) => {
                  if (e.currentTarget.src.includes('/logo/logo.jpeg')) return;
                  e.currentTarget.src = '/logo/logo.jpeg';
                }}
              />
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={16} />
              <div>
                <div className="text-xs text-gray-500">Delivery to</div>
                <div className="font-semibold">{deliveryLocation}</div>
              </div>
            </div>
            <div className="flex-1 relative z-40">
              <SearchSuggestions
                searchQuery={searchQuery}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                onInputChange={handleSearchChange}
                categories={categories}
              />
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <Link href="/cart" className="cursor-pointer hover:text-gray-600 transition-colors relative">
                <ShoppingCart size={20} />
                {isClient && getTotalItems() > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link href="/account" className="cursor-pointer hover:text-gray-600 transition-colors">
                <User size={20} />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="cursor-pointer hover:text-gray-600 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
          
          {/* Mobile Layout */}
          <div className="sm:hidden max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="shrink-0">
                <img 
                src={logoUrl || "/logo/logo.jpeg"} 
                alt="Fmod Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                    if (e.currentTarget.src.includes('/logo/logo.jpeg')) return;
                    e.currentTarget.src = '/logo/logo.jpeg';
                }}
                />
              </Link>
              
              {/* Icons */}
              <div className="flex items-center gap-6">
                <Link href="/cart" className="cursor-pointer hover:text-gray-600 transition-colors relative">
                  <ShoppingCart size={24} />
                  {isClient && getTotalItems() > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <Link href="/account" className="cursor-pointer hover:text-gray-600 transition-colors">
                  <User size={24} />
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(true)} 
                  className="cursor-pointer hover:text-gray-600 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
            
            {/* Full Width Search Bar - Separate Row */}
            <div className="mt-3 relative z-40">
              <SearchSuggestions
                searchQuery={searchQuery}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                onInputChange={handleSearchChange}
                categories={categories}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#266000' }} className="relative">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white text-[12px] font-medium">
              {loading ? (
                <div className="col-span-full text-center py-4">Loading categories...</div>
              ) : (
                displayedCategories.map((item) => {
                  const navKey = `${item.isSpecial ? "special:" : ""}${item.slug}`;
                  const baseHref = item.isSpecial ? `/special/${item.slug}` : `/${item.slug}`;
                  return (
                    <div 
                      key={navKey}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(navKey)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link 
                        href={baseHref}
                        className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors py-0.5 font-medium"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <ChevronDown size={10} />
                      </Link>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === navKey && item.subcategories.length > 0 && (
                        <div 
                          className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 hidden sm:block"
                          onMouseEnter={() => handleMouseEnter(navKey)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="p-1.5">
                            <div className="text-gray-900 text-xs font-semibold mb-1.5 border-b pb-1.5">{item.name}</div>
                            <div className="grid grid-cols-1 gap-0.5 max-h-60 overflow-y-auto">
                              {item.subcategories.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`${baseHref}/${subcat.slug}`}
                                  className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors group"
                                >
                                  {subcat.image && (
                                    <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                                      <img 
                                        src={subcat.image} 
                                        alt={subcat.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-700 group-hover:text-green-700 transition-colors">
                                    {subcat.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {totalRows > 2 && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-white text-xs hover:text-gray-300 transition-colors underline"
                >
                  {showAll ? 'Show Less' : 'More Categories'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
