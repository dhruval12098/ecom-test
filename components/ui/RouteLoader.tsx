"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setVisible(true);
    setProgress(15);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 8 : prev));
    }, 120);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 250);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 400);

    return () => {
      clearTimeout(completeTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="route-progress"
      style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
    />
  );
}
