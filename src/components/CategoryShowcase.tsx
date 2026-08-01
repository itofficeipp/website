"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const ROTATE_MS = 3000;

export function CategoryShowcase({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: Product[];
}) {
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
      className="section container categoryShowcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="sectionTitle">
        <div><span>DANH MỤC</span><h2>{title}</h2></div>
        <Link href={viewAllHref}>Xem tất cả <ArrowRight size={16} /></Link>
      </div>
      <div className="categoryShowcaseWrap">
        {maxIndex > 0 && (
          <button
            type="button"
            className="carouselArrow carouselArrowLeft"
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            disabled={index <= 0}
            aria-label="Xem sản phẩm trước"
          >
            <ChevronLeft size={20} />
          </button>
        )}
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
        {maxIndex > 0 && (
          <button
            type="button"
            className="carouselArrow carouselArrowRight"
            onClick={() => setIndex((prev) => Math.min(maxIndex, prev + 1))}
            disabled={index >= maxIndex}
            aria-label="Xem sản phẩm tiếp theo"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
