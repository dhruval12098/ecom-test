"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, ShoppingCart, Trash2, RotateCcw } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  quantity: number;
  weight: string;
  inStock: boolean;
  variantId?: number | null;
  variantName?: string | null;
  category?: string;
  subcategory?: string;
  slug?: string;
  shippingMethod?: string;
  shipping_method?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, showNotification?: boolean) => void;
  removeFromCart: (id: number, variantId?: number | null) => void;
  updateQuantity: (id: number, quantity: number, variantId?: number | null) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load cart from localStorage after component mounts
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((item) => ({
              ...item,
              price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
              originalPrice: Number.isFinite(Number(item.originalPrice)) ? Number(item.originalPrice) : undefined,
              quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1,
              inStock: typeof item.inStock === "boolean" ? item.inStock : true,
              imageUrl: item.imageUrl || ""
            }));
            setCartItems(sanitized);
          } else {
            setCartItems([]);
          }
        } catch (e) {
          console.error('Failed to parse cart from localStorage');
          localStorage.removeItem('cart');
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const normalizeVariantId = (variantId?: number | null) =>
    variantId === undefined ? null : variantId;

  const isSameCartLine = (a: CartItem, b: { id: number; variantId?: number | null }) =>
    a.id === b.id && normalizeVariantId(a.variantId) === normalizeVariantId(b.variantId);

  const addToCart = (item: Omit<CartItem, 'quantity'>, showNotification: boolean = true) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => isSameCartLine(cartItem, item));
      
      if (existingItem) {
        // If item exists, increase quantity
        const updatedItems = prevItems.map(cartItem =>
          isSameCartLine(cartItem, item)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        
        // Show toast notification for quantity increase (only if requested)
        if (showNotification) {
          toast.success(`${item.name} quantity increased to ${existingItem.quantity + 1}`, {
            duration: 2000,
            icon: <ShoppingCart className="h-5 w-5" />,
            id: `cart-${item.id}`,
          });
        }
        
        return updatedItems;
      } else {
        // If item doesn't exist, add new item with quantity 1
        const newItem = { ...item, quantity: 1 };
        
        // Show toast notification for new item added (only if requested)
        if (showNotification) {
          toast.success(`${item.name} added to cart`, {
            duration: 2000,
            icon: <Check className="h-5 w-5" />,
            id: `cart-${item.id}`,
            action: {
              label: 'View Cart',
              onClick: () => window.location.href = '/cart'
            }
          });
        }
        
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: number, variantId?: number | null) => {
    const itemToRemove = cartItems.find(item => isSameCartLine(item, { id, variantId }));
    setCartItems(prevItems => prevItems.filter(item => !isSameCartLine(item, { id, variantId })));
    
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} removed from cart`, {
        duration: 2000,
        icon: <Trash2 className="h-5 w-5" />,
      });
    }
  };

  const updateQuantity = (id: number, quantity: number, variantId?: number | null) => {
    if (quantity < 1) {
      removeFromCart(id, variantId);
      return;
    }
    
    const itemToUpdate = cartItems.find(item => isSameCartLine(item, { id, variantId }));
    setCartItems(prevItems =>
      prevItems.map(item =>
        isSameCartLine(item, { id, variantId }) ? { ...item, quantity } : item
      )
    );
    
    if (itemToUpdate && quantity > itemToUpdate.quantity) {
      toast.success(`${itemToUpdate.name} quantity updated to ${quantity}`, {
        duration: 2000,
        icon: <ShoppingCart className="h-5 w-5" />,
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared successfully', {
      duration: 2000,
      icon: <RotateCcw className="h-5 w-5" />,
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
