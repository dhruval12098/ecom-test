"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

export default function CategoryCard({ title = "Category", prefix = "Prefix", bgColor = "#9ca308", icon = null, slug }: { title?: string; prefix?: string; bgColor?: string; icon?: ReactNode | null; slug?: string; }) {
  const categorySlug = slug || title.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link href={`/${categorySlug}`} className="w-40 sm:w-52 h-72 sm:h-80 bg-gray-200 rounded-3xl overflow-hidden flex flex-col">
      {/* Card Image/Color Area */}
      <div 
        className="w-full flex-1 rounded-3xl flex items-center justify-center min-h-[60%]"
        style={{ backgroundColor: bgColor }}
      >
        {icon ? (
          <div className="text-white scale-125">
            {icon}
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" className="w-12 h-12 scale-125">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="px-4 pt-3 pb-4 text-center">
        <h3 className="text-black font-bold text-lg leading-tight">{title}</h3>
        <p className="text-gray-600 font-medium text-base leading-tight mt-1">{prefix}</p>
      </div>
    </Link>
  );
}
