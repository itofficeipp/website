import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProducts } from "@/lib/data";
import { categories, normalizeCategory } from "@/lib/categories";
import { getProductTypeOptions } from "@/lib/productTypes";

export const dynamic = "force-dynamic";

function matchesCategory(p: { category: string }, category: string) {
  return normalizeCategory(p.category).includes(category);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; type: string }>;
}): Promise<Metadata> {
  const { category, type } = await params;
  const cat = categories.find((c) => c.slug === category);
  const typeOption = getProductTypeOptions(category).find((t) => t.slug === type);
  if (!cat || !typeOption) return {};

  const title = `${typeOption.label} ${cat.label} | Tin Học Đông Du`;
  return {
    title,
    description: `Mua ${typeOption.label.toLowerCase()} thuộc danh mục ${cat.label} chính hãng, giá tốt tại Tin Học Đông Du – 81 Đường T5, Hưng Long, TP.HCM. Tư vấn: 0918 620 986.`,
    alternates: { canonical: `/san-pham/danh-muc/${category}/${type}` },
    openGraph: {
      title,
      description: `Mua ${typeOption.label.toLowerCase()} chính hãng, giá tốt tại Tin Học Đông Du.`,
    },
  };
}

export default async function ProductTypePage({
  params,
}: {
  params: Promise<{ category: string; type: string }>;
}) {
  const { category, type } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const typeOption = getProductTypeOptions(category).find((t) => t.slug === type);
  if (!typeOption) notFound();

  const products = (await getProducts()).filter(
    (p) => matchesCategory(p, category) && p.product_type === typeOption.label
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://tinhocdongdu.com" },
      { "@type": "ListItem", position: 2, name: "Sản phẩm", item: "https://tinhocdongdu.com/san-pham" },
      { "@type": "ListItem", position: 3, name: cat.label, item: `https://tinhocdongdu.com/san-pham/danh-muc/${category}` },
      { "@type": "ListItem", position: 4, name: typeOption.label, item: `https://tinhocdongdu.com/san-pham/danh-muc/${category}/${type}` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }}
        />
        <section className="pageHero">
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.7 }}>
              <a href="/">Trang chủ</a> &rsaquo; <a href="/san-pham">Sản phẩm</a> &rsaquo;{" "}
              <a href={`/san-pham/danh-muc/${category}`}>{cat.label}</a> &rsaquo; {typeOption.label}
            </nav>
            <h1>{typeOption.label}</h1>
            <p>Tìm {typeOption.label.toLowerCase()} chính hãng, giá tốt tại Tin Học Đông Du.</p>
          </div>
        </section>
        <section className="section container">
          {products.length ? (
            <div className="productGrid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty">Chưa có sản phẩm trong loại này.</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
