import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublishedPosts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tin công nghệ", description: "Kiến thức chọn mua, sử dụng và bảo trì thiết bị công nghệ.", alternates: { canonical: "/tin-tuc" } };

export default async function NewsPage() {
  const posts = await getPublishedPosts();
  return <><SiteHeader /><main><section className="pageHero"><div className="container"><h1>Tin công nghệ</h1><p>Kinh nghiệm chọn mua và sử dụng thiết bị hiệu quả.</p></div></section><section className="section container"><div className="postGrid">{posts.map((post) => <article key={post.id}><Link href={`/tin-tuc/${post.slug}`}><small>{post.category}</small><h3>{post.title}</h3><p>{post.excerpt}</p><span>Đọc bài viết →</span></Link></article>)}</div></section></main><SiteFooter /></>;
}
