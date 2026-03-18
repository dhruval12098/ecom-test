"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function CategoryCard({
  title = "Category",
  prefix = "Prefix",
  bgColor = "#9ca308",
  icon = null,
  slug,
  imageUrl
}: {
  title?: string;
  prefix?: string;
  bgColor?: string;
  icon?: ReactNode | null;
  slug?: string;
  imageUrl?: string | null;
}) {
  const categorySlug = slug || title.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link href={`/${categorySlug}`} className="w-full max-w-[185px] mx-auto h-32 sm:h-44 md:h-56 bg-gray-200 rounded-md overflow-hidden flex flex-col">
      {/* Card Image/Color Area */}
      <div 
        className="w-full flex-1 rounded-md flex items-center justify-center min-h-[70%] overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-md" />
        ) : icon ? (
          <div className="text-white scale-90 sm:scale-110">
            {icon}
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" className="w-8 h-8 sm:w-10 sm:h-10 scale-110">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="px-2 sm:px-2.5 pt-1.5 pb-2 text-center">
        <h3 className="text-black font-bold text-[10px] sm:text-xs md:text-sm leading-tight line-clamp-2">{title}</h3>
        <p className="text-gray-600 font-medium text-[9px] sm:text-[10px] md:text-xs leading-tight mt-0.5 line-clamp-1">{prefix}</p>
      </div>
    </Link>
  );
}
