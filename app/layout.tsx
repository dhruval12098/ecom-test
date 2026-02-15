import type { Metadata } from "next";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import SiteChrome from "@/components/layout/SiteChrome";
import RouteLoader from "@/components/ui/RouteLoader";
import PageTransition from "@/components/ui/PageTransition";

export const metadata: Metadata = {
  title: "Tulsi | Indian grocery store",
  description: "Indian grocery store",
  icons: {
    icon: "/favcion.ico",
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
              <RouteLoader />
              <PageTransition />
              <SiteChrome>{children}</SiteChrome>
              <Toaster />
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
