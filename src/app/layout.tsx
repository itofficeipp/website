import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tinhocdongdu.com"),
  title: {
    default: "Tin Học Đông Du - Máy tính, máy in, camera và dịch vụ CNTT",
    template: "%s | Tin Học Đông Du",
  },
  description:
    "Tin Học Đông Du cung cấp laptop, máy tính, máy in, camera, thiết bị mạng, linh kiện và dịch vụ bảo trì doanh nghiệp tại TP Hồ Chí Minh.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Tin Học Đông Du",
    title: "Tin Học Đông Du",
    description: "Laptop, máy tính, máy in, camera, thiết bị mạng, linh kiện và dịch vụ bảo trì doanh nghiệp.",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["ComputerStore", "Organization"],
    "@id": "https://tinhocdongdu.com/#organization",
    name: "Tin Học Đông Du",
    url: "https://tinhocdongdu.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tinhocdongdu.com/icon-192.png",
      width: 192,
      height: 192,
    },
    telephone: "+84918620986",
    priceRange: "₫₫",
    address: {
      "@type": "PostalAddress",
      streetAddress: "81 Đường T5, Ấp 4, Xã Hưng Long",
      addressLocality: "TP Hồ Chí Minh",
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84918620986",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://tinhocdongdu.com/#website",
    url: "https://tinhocdongdu.com",
    name: "Tin Học Đông Du",
    publisher: { "@id": "https://tinhocdongdu.com/#organization" },
    inLanguage: "vi-VN",
  };

  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
