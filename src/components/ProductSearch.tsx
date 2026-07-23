"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import styles from "./ProductSearch.module.css";

type SearchProduct = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  summary: string;
  price: number;
  image_url: string;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function ProductSearch() {
  const [value, setValue] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const keyword = value.trim();
    if (keyword.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(keyword)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setProducts(data.products);
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!value.trim()) event.preventDefault();
  };

  const handleKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || !products.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % products.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? products.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      window.location.href = `/san-pham/${products[activeIndex].slug}`;
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <form className={styles.form} action="/san-pham" onSubmit={submit}>
        <Search size={19} />
        <input
          name="q"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            if (nextValue.trim().length < 2) {
              setProducts([]);
              setLoading(false);
              setOpen(false);
            }
          }}
          onFocus={() => value.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKeys}
          placeholder="Bạn cần tìm sản phẩm gì?"
          aria-label="Tìm sản phẩm"
          role="combobox"
          aria-expanded={open}
          aria-controls="product-search-results"
          autoComplete="off"
        />
        {loading && <LoaderCircle className={styles.spinner} size={18} />}
        {!loading && value && <button type="button" className={styles.clear} onClick={() => { setValue(""); setOpen(false); }} aria-label="Xóa nội dung"><X size={17} /></button>}
        <button type="submit" className={styles.submit}>Tìm kiếm</button>
      </form>

      {open && value.trim().length >= 2 && (
        <div className={styles.dropdown} id="product-search-results" role="listbox">
          {loading && !products.length ? (
            <p className={styles.message}>Đang tìm sản phẩm...</p>
          ) : products.length ? (
            <>
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/san-pham/${product.slug}`}
                  className={`${styles.item} ${activeIndex === index ? styles.active : ""}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.image}><Image src={product.image_url} alt="" fill sizes="72px" /></span>
                  <span className={styles.info}>
                    <strong>{product.name}</strong>
                    <small>{product.brand} • {product.summary}</small>
                    <b>{currency.format(product.price)}</b>
                  </span>
                </Link>
              ))}
              <Link className={styles.viewAll} href={`/san-pham?q=${encodeURIComponent(value.trim())}`}>
                Xem tất cả kết quả cho “{value.trim()}”
              </Link>
            </>
          ) : (
            <p className={styles.message}>Không tìm thấy sản phẩm phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
}
