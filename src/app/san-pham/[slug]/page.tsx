import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProduct } from "@/lib/data";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seo = product as any;
  const title = seo.meta_title || product.name;
  const description = seo.meta_description || product.summary;
  const canonical = seo.canonical_url || `/san-pham/${product.slug || slug}`;
  const image = seo.og_image_url || product.image_url;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: seo.robots_index !== false,
      follow: seo.robots_follow !== false,
    },
    openGraph: {
      title: seo.og_title || title,
      description: seo.og_description || description,
      images: image ? [image] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const cartProduct = { id: product.id, slug: product.slug, name: product.name, price: product.price, image_url: product.image_url };
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: [product.image_url], description: product.summary, sku: String(product.id), brand: { "@type": "Brand", name: product.brand }, offers: { "@type": "Offer", url: `https://tinhocdongdu.com/san-pham/${product.slug}`, priceCurrency: "VND", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" } };
  return (
    <>
      <SiteHeader />
      <main className="section container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <div className="detail">
          <div className="detailImage"><Image src={product.image_url} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <article className="detailInfo">
            <small>{product.brand} • {product.category}</small>
            <h1>{product.name}</h1>
            <p className="summary">{product.summary}</p>
            <div className="detailPrice">{currency.format(product.price)}</div>
            <p className="stock">{product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Tạm hết hàng"}</p>
            <ProductActions product={cartProduct} disabled={product.stock < 1} />
            <h2>Mô tả sản phẩm</h2>
            <p className="summary">{product.description}</p>
            <h2 className="specsTitle">Thông số kỹ thuật</h2>
            <table className="specs"><tbody>{Object.entries(product.specifications || {}).map(([key, value]) => <tr key={key}><td>{key}</td><td>{value}</td></tr>)}</tbody></table>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
