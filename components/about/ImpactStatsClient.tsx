"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  label: string;
  target: number;
};

export default function ImpactStatsClient({ stats }: { stats: StatItem[] }) {
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateNumbers(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!animateNumbers || !rootRef.current) return;
    const counters = rootRef.current.querySelectorAll(".animate-countup");
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target") || "0", 10);
      const duration = 3000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          if (target >= 1000000) {
            counter.textContent = Math.ceil(current / 1000000) + "M+";
          } else if (target >= 1000) {
            counter.textContent = Math.ceil(current / 1000) + "K+";
          } else {
            counter.textContent = Math.ceil(current) + (target >= 100 ? "%" : "+");
          }
          requestAnimationFrame(updateCounter);
        } else {
          if (target >= 1000000) {
            counter.textContent = target / 1000000 + "M+";
          } else if (target >= 1000) {
            counter.textContent = target / 1000 + "K+";
          } else {
            counter.textContent = target + (target >= 100 ? "%" : "+");
          }
        }
      };

      updateCounter();
    });
  }, [animateNumbers]);

  return (
    <div ref={rootRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-center">
      {stats.map((stat, index) => (
        <div key={index} className="border border-green-300 rounded-xl p-4 sm:p-6">
          <div
            className="text-3xl sm:text-5xl font-bold text-white mb-2 animate-countup"
            data-target={stat.target}
          >
            0
          </div>
          <div className="text-sm sm:text-base text-green-100">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
