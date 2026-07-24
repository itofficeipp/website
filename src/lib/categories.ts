export const categories = [
  { slug: "laptop", label: "Laptop" },
  { slug: "pc-linh-kien", label: "PC & Linh kiện" },
  { slug: "phu-kien", label: "Phụ kiện" },
  { slug: "man-hinh", label: "Màn hình" },
  { slug: "may-in", label: "Máy in" },
  { slug: "camera", label: "Camera" },
  { slug: "thiet-bi-mang", label: "Thiết bị mạng" },
  { slug: "dich-vu-bao-tri-doanh-nghiep", label: "Dịch vụ bảo trì doanh nghiệp" },
];

export function normalizeCategory(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
