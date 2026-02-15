"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportWidget from "@/components/support/SupportWidget";

const HIDE_ON = ["/login", "/signup"];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname ? HIDE_ON.includes(pathname) : false;

  return (
    <>
      {!hideChrome && <Header />}
      {children}
      {!hideChrome && <Footer />}
      <SupportWidget />
    </>
  );
}
