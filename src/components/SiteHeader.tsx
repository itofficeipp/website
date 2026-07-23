import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSearch } from "@/components/ProductSearch";
import { CartButton } from "@/components/CartProvider";
import { SiteNav } from "@/components/SiteNav";
import { SiteMobileMenu } from "@/components/SiteMobileMenu";

function SiteNavFallback() {
  return (
    <nav className="nav">
      <div className="container">
        <Link href="/san-pham">Danh mục sản phẩm</Link>
        <Link href="/san-pham?category=laptop">Laptop</Link>
        <Link href="/san-pham?category=pc-linh-kien">PC & Linh kiện</Link>
        <Link href="/san-pham?category=phu-kien">Phụ kiện</Link>
        <Link href="/san-pham?category=man-hinh">Màn hình</Link>
        <Link href="/san-pham?category=may-in">Máy in</Link>
        <Link href="/san-pham?category=camera">Camera</Link>
        <Link href="/san-pham?category=thiet-bi-mang">Thiết bị mạng</Link>
        <Link href="/san-pham?category=dich-vu-bao-tri-doanh-nghiep">Dịch vụ bảo trì doanh nghiệp</Link>
        <Link href="/tin-tuc">Tin công nghệ</Link>
        <Link href="/lien-he">Liên hệ</Link>
      </div>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <div className="container">Giao hàng toàn quốc • Tư vấn: 0918 620 986</div>
      </div>

      <header className="header">
        <div className="container headerMain">
          <Link href="/" className="logo">
            <Image
              src="/logo-dong-du.svg"
              alt="Tin Học Đông Du"
              width={166}
              height={60}
              priority
            />
          </Link>

          <ProductSearch />

          <a className="hotline" href="tel:0918620986">
            Tư vấn
            <br />
            <strong>0918 620 986</strong>
          </a>

          <CartButton />

          <Suspense fallback={null}>
            <SiteMobileMenu />
          </Suspense>
        </div>

        <Suspense fallback={<SiteNavFallback />}>
          <SiteNav />
        </Suspense>
      </header>
    </>
  );
}
