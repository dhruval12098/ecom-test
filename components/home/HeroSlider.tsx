"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";
import Link from "next/link";

export type HeroSlide = {
  id: number;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
};

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides?.length]);

  const showHeroSkeleton = !slides || slides.length === 0;
  const showControls = !!slides && slides.length > 1;

  const goPrev = () => {
    if (!slides || slides.length === 0) return;
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!slides || slides.length === 0) return;
    setActive((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: ReactTouchEvent) => {
    if (!showControls) return;
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: ReactTouchEvent) => {
    if (!showControls) return;
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX == null) return;

    const endX = e.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    // Basic swipe threshold to avoid accidental taps
    if (Math.abs(deltaX) < 50) return;
    if (deltaX > 0) goPrev();
    else goNext();
  };

  return (
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
          <div
            className="relative w-[98%] h-[70vh] sm:h-[90%] mt-3 sm:mt-0 rounded-2xl sm:rounded-[28px] overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slide: HeroSlide, index: number) => (
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
                          backgroundImage: `url('${
                            isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl
                          }')`,
                        }}
                      />
                    </a>
                  ) : (
                    <Link href={slide.linkUrl} className="block w-full h-full cursor-pointer">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${
                            isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl
                          }')`,
                        }}
                      />
                    </Link>
                  )
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${
                        isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl
                      }')`,
                    }}
                  />
                )}
              </div>
            ))}

            {showControls ? (
              <>
                <button
                  type="button"
                  aria-label="Previous banner"
                  onClick={goPrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur flex items-center justify-center shadow-md transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Next banner"
                  onClick={goNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white/90 backdrop-blur flex items-center justify-center shadow-md transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-2">
            {slides.map((_: HeroSlide, index: number) => (
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
  );
}
