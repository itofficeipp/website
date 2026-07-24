"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const STEP = 277;
const AUTO_ADVANCE_MS = 2000;

export function ProductCarousel({ products, rows = 1 }: { products: Product[]; rows?: 1 | 2 }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  function scroll(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * STEP, behavior: "smooth" });
  }

  useEffect(() => {
    if (products.length < 2) return;
    const interval = setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo(atEnd ? { left: 0, behavior: "smooth" } : { left: track.scrollLeft + STEP, behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <div
      className="carousel"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <button type="button" className="carouselArrow carouselArrowLeft" onClick={() => scroll(-1)} aria-label="Xem sản phẩm trước">
        <ChevronLeft size={20} />
      </button>
      <div className={rows === 2 ? "carouselTrack carouselTrackRows2" : "carouselTrack"} ref={trackRef}>
        {products.map((product) => (
          <div className="carouselItem" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button type="button" className="carouselArrow carouselArrowRight" onClick={() => scroll(1)} aria-label="Xem sản phẩm tiếp theo">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
