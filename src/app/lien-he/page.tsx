import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ Tin Học Đông Du tại TP Hồ Chí Minh.",
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="pageHero"><div className="container"><h1>Liên hệ Tin Học Đông Du</h1><p>Liên hệ để được tư vấn sản phẩm và hỗ trợ đơn hàng.</p></div></section>
        <section className="section container">
          <div className={`contactCard ${styles.card}`}>
            <div><MapPin /><span><strong>Địa chỉ</strong>81 Đường T5, Ấp 4, Xã Hưng Long, TP Hồ Chí Minh, Việt Nam</span></div>
            <a href="tel:0918620986"><Phone /><span><strong>Số điện thoại</strong>0918620986</span></a>
            <a href="https://zalo.me/0918620986" target="_blank" rel="noopener noreferrer">
              <span className={styles.zaloIcon}>Zalo</span>
              <span><strong>Zalo</strong>091862098</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
