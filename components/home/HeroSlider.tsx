"use client";

import { useEffect, useState } from "react";
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
          <div className="relative w-[98%] h-[70vh] sm:h-[90%] mt-3 sm:mt-0 rounded-2xl sm:rounded-[28px] overflow-hidden">
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
