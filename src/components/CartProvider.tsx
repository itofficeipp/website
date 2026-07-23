"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import styles from "./Cart.module.css";

export type CartProduct = { id: number; slug: string; name: string; price: number; image_url: string };
export type CartItem = CartProduct & { quantity: number };
type CartContextValue = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (product: CartProduct) => void;
  clear: () => void;
  openCart: () => void;
};

const STORAGE_KEY = "dong-du-cart";
const CartContext = createContext<CartContextValue | null>(null);
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(stored)) setItems(stored);
      } catch {}
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const updateQuantity = (id: number, quantity: number) => {
    setItems((current) => quantity < 1 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity } : item));
  };
  const add = (product: CartProduct) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
    setOpen(true);
  };
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ items, count, ready, add, clear: () => setItems([]), openCart: () => setOpen(true) }), [items, count, ready]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {open && <div className={styles.backdrop} onMouseDown={() => setOpen(false)}>
        <aside className={styles.drawer} onMouseDown={(event) => event.stopPropagation()} aria-label="Giỏ hàng">
          <header><h2><ShoppingCart /> Giỏ hàng</h2><button onClick={() => setOpen(false)} aria-label="Đóng giỏ hàng"><X /></button></header>
          <div className={styles.body}>
            {!items.length ? <div className={styles.empty}><ShoppingCart /><p>Giỏ hàng chưa có sản phẩm.</p><Link href="/san-pham" onClick={() => setOpen(false)}>Xem sản phẩm</Link></div> :
              items.map((item) => <article className={styles.item} key={item.id}>
                <Link href={`/san-pham/${item.slug}`} onClick={() => setOpen(false)}><Image src={item.image_url} alt={item.name} width={78} height={68} /></Link>
                <div><Link href={`/san-pham/${item.slug}`} onClick={() => setOpen(false)}><strong>{item.name}</strong></Link><b>{currency.format(item.price)}</b>
                  <span className={styles.quantity}><button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus /></button><em>{item.quantity}</em><button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus /></button></span>
                </div>
                <button className={styles.remove} onClick={() => updateQuantity(item.id, 0)} aria-label={`Xóa ${item.name}`}><Trash2 /></button>
              </article>)}
          </div>
          {!!items.length && <footer><span>Tạm tính <strong>{currency.format(total)}</strong></span><Link href="/dat-hang" onClick={() => setOpen(false)}>Đặt hàng</Link></footer>}
        </aside>
      </div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart components must be inside CartProvider");
  return context;
}

export function CartButton() {
  const { count, openCart } = useCart();
  return <button className="cart" onClick={openCart} aria-label={`Giỏ hàng có ${count} sản phẩm`}><ShoppingCart /><span>{count}</span></button>;
}

export function AddToCartButton({ product, className, label = "Thêm vào giỏ hàng" }: { product: CartProduct; className?: string; label?: string }) {
  const { add } = useCart();
  return <button type="button" className={className} onClick={() => add(product)}><ShoppingCart size={18} /> {label}</button>;
}
