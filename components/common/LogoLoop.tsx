'use client';

import { useEffect, useRef, useMemo } from 'react';

interface LogoLoopProps {
  logos: string[];
  logoHeight?: string; // Tailwind class for height
  gap?: string; // Tailwind class for spacing
}

export default function LogoLoop({ logos, logoHeight = 'h-24', gap = 'mx-10' }: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<{ x: number; animationFrameId: number | null }>({
    x: 0,
    animationFrameId: null
  });
  
  // Memoize the duplicated logos to prevent recreation on every render
  const duplicatedLogos = useMemo(() => [...logos, ...logos], [logos]); // Duplicate logos for seamless loop

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speed = 0.5; // px per frame
    
    const animate = () => {
      animationRef.current.x -= speed;
      // Reset when first set of logos is completely scrolled off screen
      if (Math.abs(animationRef.current.x) >= container.scrollWidth / 2) {
        animationRef.current.x = 0;
      }
      container.style.transform = `translateX(${animationRef.current.x}px)`;
      animationRef.current.animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current.animationFrameId) {
        cancelAnimationFrame(animationRef.current.animationFrameId);
      }
    };
  }, []); // Empty dependency array to prevent constant reinitialization

  return (
    <div className="overflow-hidden py-8">
      <div ref={containerRef} className="flex items-center whitespace-nowrap">
        {duplicatedLogos.map((logo, index) => (
          <div key={index} className={`${gap} flex items-center justify-center flex-shrink-0`}>
            <img src={logo} alt="brand-logo" className={`${logoHeight} object-contain`} />
          </div>
        ))}
      </div>
    </div>
  );
}