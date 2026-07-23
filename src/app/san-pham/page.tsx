import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sản phẩm và dịch vụ công nghệ",
  description:
    "Laptop, PC, màn hình, máy in, camera, thiết bị mạng, linh kiện và dịch vụ bảo trì doanh nghiệp tại Tin Học Đông Du.",
  alternates: { canonical: "/san-pham" },
};

function normalizeCategory(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;

  const keyword = q.toLocaleLowerCase("vi").trim();
  const selectedCategory = normalizeCategory(category);

  const products = (await getProducts()).filter((p) => {
    const searchText = `${p.name} ${p.brand} ${p.summary}`.toLocaleLowerCase("vi");

    const categoryText = normalizeCategory(
      [
        p.category,
        (p as { category_slug?: string }).category_slug,
        (p as { categories?: string }).categories,
      ]
        .filter(Boolean)
        .join(" ")
    );

    const matchKeyword = !keyword || searchText.includes(keyword);
    const matchCategory =
      !selectedCategory || categoryText.includes(selectedCategory);

    return matchKeyword && matchCategory;
  });

  return (
    <>
      <SiteHeader />
      <main>
        <section className="pageHero">
          <div className="container">
            <h1>Sản phẩm công nghệ</h1>
            <p>Tìm sản phẩm phù hợp cho công việc, học tập và giải trí.</p>
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
            <div className="empty">Không tìm thấy sản phẩm phù hợp.</div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
