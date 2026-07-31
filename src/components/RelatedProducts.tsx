"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const ROTATE_MS = 3000;

export function RelatedProducts({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth <= 900 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, products.length - perView);

  useEffect(() => {
    if (paused || products.length <= perView) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, products.length, perView, maxIndex]);

  if (!products.length) return null;

  return (
    <section
      className="relatedSection"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="relatedTitle">Sản phẩm tương tự</h2>
      <div className="relatedViewport">
        <div
          className="relatedTrack"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {products.map((p) => (
            <div className="relatedItem" style={{ flexBasis: `${100 / perView}%` }} key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
