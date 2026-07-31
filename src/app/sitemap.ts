import type { MetadataRoute } from "next";
import { getProducts, getPublishedPosts } from "@/lib/data";
import { getProductTypeOptions } from "@/lib/productTypes";

// Định nghĩa trực tiếp tại đây, không phụ thuộc file khác — tránh lỗi
// module-not-found nếu cấu trúc thư mục lib khác nhau giữa các môi trường.
const categories = [
  { slug: "laptop", label: "Laptop" },
  { slug: "pc-linh-kien", label: "PC & Linh kiện" },
  { slug: "phu-kien", label: "Phụ kiện" },
  { slug: "man-hinh", label: "Màn hình" },
  { slug: "may-in", label: "Máy in" },
  { slug: "camera", label: "Camera" },
  { slug: "thiet-bi-mang", label: "Thiết bị mạng" },
  { slug: "dich-vu-bao-tri-doanh-nghiep", label: "Dịch vụ bảo trì doanh nghiệp" },
];

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://tinhocdongdu.com";
  const [products, posts] = await Promise.all([getProducts(), getPublishedPosts()]);

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
  const categoriesWithProducts = categories.filter((cat) =>
    products.some((p) =>
      normalizeCategory(
        [p.category, (p as { category_slug?: string }).category_slug].filter(Boolean).join(" ")
      ).includes(cat.slug)
    )
  );

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    ...categoriesWithProducts.map((cat) => ({
      url: `${base}/san-pham/danh-muc/${cat.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    ...categoriesWithProducts.flatMap((cat) =>
      getProductTypeOptions(cat.slug)
        .filter((opt) =>
          products.some(
            (p) =>
              normalizeCategory(
                [p.category, (p as { category_slug?: string }).category_slug].filter(Boolean).join(" ")
              ).includes(cat.slug) && p.product_type === opt.label
          )
        )
        .map((opt) => ({
          url: `${base}/san-pham/danh-muc/${cat.slug}/${opt.slug}`,
          changeFrequency: "daily" as const,
          priority: 0.75,
        }))
    ),
    { url: `${base}/tin-tuc`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((p) => ({ url: `${base}/san-pham/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
