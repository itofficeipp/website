import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getPost } from "@/lib/data";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return { title: post.title, description: post.excerpt, alternates: { canonical: `/tin-tuc/${post.slug}` }, openGraph: post.image_url ? { images: [post.image_url] } : undefined };
}
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.published_at, dateModified: post.updated_at, author: { "@type": "Organization", name: "Tin Học Đông Du" }, publisher: { "@type": "Organization", name: "Tin Học Đông Du", logo: { "@type": "ImageObject", url: "https://tinhocdongdu.com/logo-dong-du.svg" } } };
  return <><SiteHeader /><main className="section container article"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><p className="articleMeta">{post.category} • {post.author}</p><h1>{post.title}</h1><p><strong>{post.excerpt}</strong></p><div className="articleBody">{post.content}</div></main><SiteFooter /></>;
}
