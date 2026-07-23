import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }], sitemap: "https://tinhocdongdu.com/sitemap.xml", host: "https://tinhocdongdu.com" };
}
