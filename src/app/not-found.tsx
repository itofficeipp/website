import Link from "next/link";
export default function NotFound() { return <main className="empty"><h1>Không tìm thấy nội dung</h1><p>Trang hoặc sản phẩm này không tồn tại.</p><Link className="buyButton" href="/">Về trang chủ</Link></main>; }
