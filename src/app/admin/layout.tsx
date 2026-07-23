import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/dang-nhap-quan-tri");
  return (
    <div className="adminShell">
      <header className="adminTop">
        <div className="container">
          <strong>TIN HỌC ĐÔNG DU • QUẢN TRỊ</strong>
          <form action="/api/auth/logout" method="post"><button>Đăng xuất</button></form>
        </div>
      </header>
      <div className="container adminGrid">
        <nav className="adminNav">
          <Link href="/admin">Bài đã đăng</Link>
          <Link href="/admin/bai-nhap">Bài nháp</Link>
          <Link href="/admin/dang-bai">Đăng bài mới</Link>
          <Link href="/admin/san-pham">Sản phẩm</Link>
          <Link href="/admin/don-hang">Đơn hàng</Link>
          <Link href="/admin/doi-mat-khau">Đổi mật khẩu</Link>
          <Link href="/" target="_blank">Xem website</Link>
        </nav>
        <section className="adminPanel">{children}</section>
      </div>
    </div>
  );
}
