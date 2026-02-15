"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 220);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div
      className={`page-transition ${visible ? "page-transition--in" : ""}`}
      aria-hidden="true"
    />
  );
}
