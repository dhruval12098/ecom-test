// API service for e-commerce frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  static _cache = new Map();
  static _normalizeProduct(raw) {
    if (!raw) return raw;
    const stockQuantity = Number(raw.stockQuantity ?? raw.stock_quantity ?? 0);
    const inStockFlag = raw.inStock ?? raw.in_stock;
    const hasQty = Number.isFinite(stockQuantity);
    const inStock = inStockFlag !== undefined
      ? Boolean(inStockFlag) && (!hasQty || stockQuantity > 0)
      : (hasQty ? stockQuantity > 0 : true);
    const imageGallery = Array.isArray(raw.imageGallery)
      ? raw.imageGallery
      : Array.isArray(raw.image_gallery)
        ? raw.image_gallery
        : [];
    const imageUrl =
      raw.imageUrl ||
      raw.image_url ||
      raw.image ||
      imageGallery[0] ||
      null;
    const variants = Array.isArray(raw.variants)
      ? raw.variants.map((variant) => ({
          ...variant,
          stockQuantity: variant.stockQuantity ?? variant.stock_quantity ?? 0
        }))
      : undefined;

    return {
      ...raw,
      imageUrl,
      imageGallery,
      stockQuantity,
      inStock,
      variants
    };
  }

  static _getCached(key) {
    const hit = ApiService._cache.get(key);
    if (!hit) return null;
    const { data, expiresAt } = hit;
    if (expiresAt && Date.now() > expiresAt) {
      ApiService._cache.delete(key);
      return null;
    }
    return data;
  }

  static _setCached(key, data, ttlMs = 300000) {
    ApiService._cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  }
  // Hero slides endpoints
  static async getHeroSlides() {
    try {
      const cached = ApiService._getCached('hero-slides');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/hero-slides`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('hero-slides', result.data || []);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      throw error;
    }
  }

  static async createHeroSlide(slideData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hero-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slideData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
  }

  static async updateHeroSlide(id, slideData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hero-slides/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slideData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
  }

  static async deleteHeroSlide(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hero-slides/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }
  }

  // About story endpoints
  static async getAboutStory() {
    try {
      const cached = ApiService._getCached('about-story');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/about-story`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching about story:', error);
      throw error;
    }
  }

  // Founders endpoints
  static async getFounders() {
    try {
      const cached = ApiService._getCached('founders');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/founders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('founders', result.data || []);
    } catch (error) {
      console.error('Error fetching founders:', error);
      throw error;
    }
  }

  // Leadership endpoints
  static async getLeadership() {
    try {
      const cached = ApiService._getCached('leadership');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/leadership`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('leadership', result.data || []);
    } catch (error) {
      console.error('Error fetching leadership team:', error);
      throw error;
    }
  }

  // Trends endpoints
  static async getTrends() {
    try {
      const cached = ApiService._getCached('trends');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/trends`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('trends', result.data || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  // Categories (nested)
  static async getCategories() {
    try {
      const cached = ApiService._getCached('categories');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const normalized = (result.data || []).map((category) => ({
        ...category,
        subcategories: Array.isArray(category.subcategories)
          ? category.subcategories.map((sub) => ({
              ...sub,
              products: Array.isArray(sub.products)
                ? sub.products.map((product) => ApiService._normalizeProduct(product))
                : []
            }))
          : []
      }));
      return ApiService._setCached('categories', normalized);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Homepage sections (top seller, best deal, new arrivals)
  static async getHomepageSection(sectionKey) {
    try {
      const cacheKey = `homepage-section:${sectionKey}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/homepage-sections?section=${encodeURIComponent(sectionKey)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached(cacheKey, result.data || []);
    } catch (error) {
      console.error('Error fetching homepage section:', error);
      return [];
    }
  }

  // Active scheduled pricing for a product
  static async getActiveSchedule(productId) {
    try {
      const cached = ApiService._getCached(`active-schedule:${productId}`);
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/scheduled-pricing/active?productId=${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached(`active-schedule:${productId}`, result.data || null);
    } catch (error) {
      console.error('Error fetching active schedule:', error);
      return null;
    }
  }

  // Announcement bar
  static async getAnnouncementBar() {
    try {
      const cached = ApiService._getCached('announcement-bar');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/announcement-bar`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('announcement-bar', result.data || null, 60000);
    } catch (error) {
      console.error('Error fetching announcement bar:', error);
      return null;
    }
  }

  // Contact info
  static async getContactInfo() {
    try {
      const cached = ApiService._getCached('contact-info');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/contact/info`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
        return ApiService._setCached('contact-info', result.data || null, 120000);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  }

  // Store settings
  static async getSettings() {
    try {
      const cached = ApiService._getCached('settings');
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached('settings', result.data || null, 120000);
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  // FAQs
  static async getFaqs(publishedOnly = true) {
    try {
      const cacheKey = `faqs:${publishedOnly ? 'published' : 'all'}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const url = `${API_BASE_URL}/api/faqs${publishedOnly ? '?published=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached(cacheKey, result.data || [], 120000);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  // Contact message submit
  static async submitContactMessage(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error submitting contact message:', error);
      throw error;
    }
  }

  // Create or update a customer profile (used after signup/login)
  static async upsertCustomer(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return ApiService._setCached('contact-info', result.data || null);
    } catch (error) {
      console.error('Error upserting customer:', error);
      throw error;
    }
  }

  static async getCustomerProfile(authUserId) {
    try {
      if (!authUserId) return null;
      const response = await fetch(
        `${API_BASE_URL}/api/customers/profile?authUserId=${encodeURIComponent(authUserId)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw error;
    }
  }

  static async getProductBySlug(slug) {
    try {
      const cacheKey = `product:${slug}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/products/slug/${encodeURIComponent(slug)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const normalized = ApiService._normalizeProduct(result.data || null);
      return ApiService._setCached(cacheKey, normalized, 120000);
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      throw error;
    }
  }

  static async getProductById(id) {
    try {
      if (id === undefined || id === null || id === "" || Number.isNaN(Number(id))) {
        return null;
      }
      const cacheKey = `product:id:${id}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const normalized = ApiService._normalizeProduct(result.data || null);
      return ApiService._setCached(cacheKey, normalized, 120000);
    } catch (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }
  }

  static async getCustomerAddresses(customerId) {
    try {
      const cacheKey = `customer-addresses:${customerId}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const response = await fetch(
        `${API_BASE_URL}/api/customer-addresses?customerId=${encodeURIComponent(customerId)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached(cacheKey, result.data || []);
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      throw error;
    }
  }

  static async createCustomerAddress(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer-addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error creating customer address:', error);
      throw error;
    }
  }

  static async updateCustomerAddress(id, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer-addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error updating customer address:', error);
      throw error;
    }
  }

  static async deleteCustomerAddress(id, customerId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer-addresses/${id}?customerId=${encodeURIComponent(customerId)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting customer address:', error);
      throw error;
    }
  }

  static async setDefaultCustomerAddress(id, customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer-addresses/${id}/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  static async updateAboutStory(storyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/about-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating about story:', error);
      throw error;
    }
  }

  static async uploadAboutStoryImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/about-story/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error uploading about story image:', error);
      throw error;
    }
  }

  // Storage endpoints
  static async getStorageImages() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching storage images:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Orders
  static async createOrder(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let details = '';
        try {
          const err = await response.json();
          details = err?.error || err?.message || '';
        } catch (e) {
          // ignore
        }
        throw new Error(`HTTP error! status: ${response.status}${details ? ` - ${details}` : ''}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async getOrdersByContact({ email, phone }) {
    try {
      if (!email && !phone) return [];
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getOrderById(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Shipping rates
  static async getShippingRates(activeOnly = true) {
    try {
      const cacheKey = `shipping-rates:${activeOnly ? 'active' : 'all'}`;
      const cached = ApiService._getCached(cacheKey);
      if (cached) return cached;
      const url = `${API_BASE_URL}/api/shipping-rates${activeOnly ? '?active=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return ApiService._setCached(cacheKey, result.data || [], 120000);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      throw error;
    }
  }

  // Coupons
  static async getCoupons() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  // Support
  static async createSupportTicket(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  static async createSupportMessage(ticketId, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating support message:', error);
      throw error;
    }
  }

}

export default ApiService;
