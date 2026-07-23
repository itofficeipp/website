import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { currency } from "@/lib/utils";
import { AddToCartButton } from "@/components/CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;
  const cartProduct = { id: product.id, slug: product.slug, name: product.name, price: product.price, image_url: product.image_url };
  return (
    <article className="productCard">
      <Link href={`/san-pham/${product.slug}`} className="productImage">
        <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" />
        {product.badge && <span>{product.badge}</span>}
      </Link>
      <div className="productBody">
        <small>{product.brand}</small>
        <h3><Link href={`/san-pham/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.summary}</p>
        <div className="price"><div><strong>{currency.format(product.price)}</strong>{product.old_price && <del>{currency.format(product.old_price)}</del>}</div>{discount > 0 && <b>-{discount}%</b>}</div>
        <AddToCartButton product={cartProduct} className="buyButton" />
      </div>
    </article>
  );
}
