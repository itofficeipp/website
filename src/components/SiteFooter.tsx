import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer>
      <div className="container footerGrid">
        <div>
          <Image src="/logo-dong-du.svg" alt="Tin Học Đông Du" width={170} height={65} />
          <p>Thiết bị công nghệ chính hãng, tư vấn đúng nhu cầu và hỗ trợ tận tâm.</p>
        </div>
        <div>
          <h3>Sản phẩm</h3>
          <Link href="/san-pham">Tất cả sản phẩm</Link>
          <Link href="/san-pham?category=Laptop">Laptop</Link>
          <Link href="/san-pham?category=PC">PC và linh kiện</Link>
          <Link href="/san-pham?category=Màn hình">Màn hình</Link>
          <Link href="/san-pham?category=Máy in">Máy in</Link>
          <Link href="/san-pham?category=Camera">Camera</Link>
          <Link href="/san-pham?category=Thiết bị mạng">Thiết bị mạng</Link>
          <Link href="/san-pham?category=Dịch vụ bảo trì doanh nghiệp">Dịch vụ bảo trì doanh nghiệp</Link>
        </div>
        <div>
          <h3>Thông tin</h3>
          <Link href="/tin-tuc">Tin công nghệ</Link>
          <Link href="/lien-he">Liên hệ</Link>
        </div>
        <div className={styles.contact}>
          <h3>Liên hệ</h3>
          <p><MapPin /> <span>81 Đường T5, Ấp 4, Xã Hưng Long, TP Hồ Chí Minh, Việt Nam</span></p>
          <a href="tel:0918620986"><Phone /> <span>0918 620 986</span></a>
          <a href="https://zalo.me/0918620986" target="_blank" rel="noopener noreferrer">
            <span className={styles.zaloIcon}>Zalo</span>
            <span>091862098</span>
          </a>
        </div>
      </div>
      <div className="container copyright">© 2026 Tin Học Đông Du • tinhocdongdu.com</div>
    </footer>
  );
}
