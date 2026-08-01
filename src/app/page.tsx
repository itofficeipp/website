import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Laptop, Monitor, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProducts, getProductsByCategory, getPublishedPosts } from "@/lib/data";
import { categories } from "@/lib/categories";
import { CategoryShowcase } from "@/components/CategoryShowcase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, posts, categoryProducts] = await Promise.all([
    getProducts(8),
    getPublishedPosts(3),
    Promise.all(categories.map((c) => getProductsByCategory(c.label, 10))),
  ]);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <Image src="/images/hero-tech.png" alt="" fill priority className="heroImage" /><div className="heroShade" />
          <div className="container heroContent"><span>Công nghệ chính hãng</span><h1>Nâng cấp hiệu năng.<br /><em>Tối ưu trải nghiệm.</em></h1><p>Laptop, PC, linh kiện và phụ kiện được tư vấn theo đúng nhu cầu.</p><Link href="/san-pham">Khám phá sản phẩm <ArrowRight size={17} /></Link></div>
        </section>
        <section className="benefits"><div className="container benefitGrid">
          <div><Truck /><span><strong>Giao hàng toàn quốc</strong><small>Đóng gói cẩn thận</small></span></div>
          <div><ShieldCheck /><span><strong>Bảo hành chính hãng</strong><small>Hỗ trợ minh bạch</small></span></div>
          <div><Headphones /><span><strong>Tư vấn tận tâm</strong><small>Đúng nhu cầu sử dụng</small></span></div>
          <div><Monitor /><span><strong>Sản phẩm đa dạng</strong><small>Laptop, PC, linh kiện</small></span></div>
        </div></section>
        <section className="section container">
          <div className="sectionTitle"><div><span>SẢN PHẨM NỔI BẬT</span><h2>Lựa chọn dành cho bạn</h2></div><Link href="/san-pham">Xem tất cả <ArrowRight size={16} /></Link></div>
          <div className="productGrid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
        {categories.map((c, i) => categoryProducts[i].length > 0 && (
          <CategoryShowcase key={c.slug} title={c.label} viewAllHref={`/san-pham/danh-muc/${c.slug}`} products={categoryProducts[i]} />
        ))}
        <section className="categoryBand"><div className="container categoryGrid">
          <Link href="/san-pham?category=Laptop"><Laptop /><strong>Laptop</strong><span>Học tập, văn phòng, gaming</span></Link>
          <Link href="/san-pham?category=PC"><Monitor /><strong>PC & Linh kiện</strong><span>Cấu hình theo yêu cầu</span></Link>
          <Link href="/san-pham?category=Phụ kiện"><Headphones /><strong>Phụ kiện</strong><span>Chuột, phím, tai nghe</span></Link>
        </div></section>
        {posts.length > 0 && <section className="section container">
          <div className="sectionTitle"><div><span>KIẾN THỨC CÔNG NGHỆ</span><h2>Bài viết mới</h2></div><Link href="/tin-tuc">Xem tất cả</Link></div>
          <div className="postGrid">{posts.map((post) => <article key={post.id}><Link href={`/tin-tuc/${post.slug}`}><h3>{post.title}</h3><p>{post.excerpt}</p><span>Đọc bài viết →</span></Link></article>)}</div>
        </section>}
      </main>
      <SiteFooter />
    </>
  );
}
