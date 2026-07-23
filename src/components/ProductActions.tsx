import { Phone } from "lucide-react";
import { AddToCartButton, type CartProduct } from "@/components/CartProvider";
import styles from "./ProductActions.module.css";

export function ProductActions({ product, disabled = false }: { product: CartProduct; disabled?: boolean }) {
  return (
    <div className={styles.actions}>
      {disabled ? <button className={styles.add} disabled>Tạm hết hàng</button> : <AddToCartButton product={product} className={styles.add} />}
      <a className={styles.call} href="tel:0918620986"><Phone size={18} /> Gọi ngay</a>
    </div>
  );
}
