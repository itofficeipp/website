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
  const categoryText = normalizeCategory(
    [
      p.category,
      (p as { category_slug?: string }).category_slug,
      (p as { categories?: string }).categories,
    ]
      .filter(Boolean)
      .join(" ")
  );
  return categoryText.includes(category);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  const products = await getProducts();
  const label = cat?.label || products.find((p) => matchesCategory(p, category))?.category;
  if (!label) return {};

  return {
    title: `${label} | Tin Học Đông Du`,
    description: `Mua ${label} chính hãng, giá tốt tại Tin Học Đông Du – 81 Đường T5, Hưng Long, TP.HCM. Tư vấn: 0918 620 986.`,
    alternates: { canonical: `/san-pham/danh-muc/${category}` },
    openGraph: {
      title: `${label} | Tin Học Đông Du`,
      description: `Mua ${label} chính hãng, giá tốt tại Tin Học Đông Du.`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);

  const products = (await getProducts()).filter((p) => matchesCategory(p, category));
  const label = cat?.label || products[0]?.category;
  const typeOptions = getProductTypeOptions(category)
    .map((opt) => ({ ...opt, count: products.filter((p) => p.product_type === opt.label).length }))
    .filter((opt) => opt.count > 0);
  if (!label) notFound();

  const breadcrumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://tinhocdongdu.com" }, { "@type": "ListItem", position: 2, name: "Sản phẩm", item: "https://tinhocdongdu.com/san-pham" }, { "@type": "ListItem", position: 3, name: label, item: `https://tinhocdongdu.com/san-pham/danh-muc/${category}` } ] };

  return (
    <>
      <SiteHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
        <section className="pageHero">
          <div className="container">
            <nav
              aria-label="Breadcrumb"
              style={{ fontSize: "0.875rem", marginBottom: "0.5rem", opacity: 0.7 }}
            >
              <a href="/">Trang chủ</a> &rsaquo; <a href="/san-pham">Sản phẩm</a> &rsaquo;{" "}
              {label}
            </nav>
            <h1>{label}</h1>
            <p>Tìm {label.toLowerCase()} chính hãng, giá tốt tại Tin Học Đông Du.</p>
            {typeOptions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                {typeOptions.map((opt) => (
                  <a
                    key={opt.slug}
                    href={`/san-pham/danh-muc/${category}/${opt.slug}`}
                    style={{ padding: "0.35rem 0.75rem", border: "1px solid #ddd", borderRadius: "999px", fontSize: "0.875rem", textDecoration: "none", color: "inherit" }}
                  >
                    {opt.label} ({opt.count})
                  </a>
                ))}
              </div>
            )}
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
            <div className="empty">Không có sản phẩm trong danh mục này.</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
