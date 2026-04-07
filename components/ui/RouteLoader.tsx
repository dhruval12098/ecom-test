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
    setProgress(20);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 10 : prev));
    }, 90);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 150);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 220);

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
