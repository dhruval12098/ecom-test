import type { Metadata } from "next";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import SiteChrome from "@/components/layout/SiteChrome";
import RouteLoader from "@/components/ui/RouteLoader";
import PageTransition from "@/components/ui/PageTransition";
import { Suspense } from "react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Tulsi | Indian Grocery Store",
    template: "%s | Tulsi",
  },

  description:
    "Tulsi is your trusted Indian grocery store offering fresh vegetables, spices, grains, and daily essentials delivered to your doorstep.",

  openGraph: {
    title: "Tulsi | Indian Grocery Store",
    description:
      "Shop authentic Indian groceries, fresh produce, and daily essentials at Tulsi.",
    url: "/",
    siteName: "Tulsi",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <Suspense fallback={null}>
                <RouteLoader />
                <PageTransition />
              </Suspense>
              <SiteChrome>{children}</SiteChrome>
              <Toaster />
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
