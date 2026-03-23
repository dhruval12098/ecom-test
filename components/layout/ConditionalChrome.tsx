"use client";

import { usePathname } from "next/navigation";
import SiteChrome from "@/components/layout/SiteChrome";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/maintenance") {
    return <>{children}</>;
  }
  return <SiteChrome>{children}</SiteChrome>;
}
