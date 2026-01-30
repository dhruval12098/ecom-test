import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Home,
  ShoppingBag,
  Info,
  Phone,
  HelpCircle,
  User,
  Heart,
  Package,
  RotateCcw,
  ShoppingCart,
  Shield,
  FileText,
  ChevronRight
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigationLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/search', icon: ShoppingBag },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Account', href: '/account', icon: User },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'My Orders', href: '/my-orders', icon: Package },
    { name: 'Returns', href: '/returns', icon: RotateCcw },
    { name: 'Cart', href: '/cart', icon: ShoppingCart },
    { name: 'Privacy Policy', href: '/privacy-policy', icon: Shield },
    { name: 'Terms & Conditions', href: '/terms-and-conditions', icon: FileText },
  ];

  const handleClose = () => {
    onClose();
  };

  // Prevent scroll propagation when interacting with sidebar
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl"
            onWheel={handleWheel}
            onTouchMove={handleTouchMove}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links - Scrollable Content */}
              <nav className="flex-1 overflow-y-auto p-6" onWheel={handleWheel} onTouchMove={handleTouchMove}>
                <div className="space-y-2 pr-2">
                  {navigationLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={handleClose}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-[#266000] transition-colors" />
                          <span className="font-medium text-gray-900 group-hover:text-[#266000] transition-colors">
                            {link.name}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#266000] transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}