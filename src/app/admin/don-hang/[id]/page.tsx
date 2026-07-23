import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/don-hang/actions";
import { query } from "@/lib/db";
import { ensureOrderTables, type Order, type OrderItem } from "@/lib/orders";
import { currency } from "@/lib/utils";
import styles from "./detail.module.css";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = {
  pending: "Chờ xác nhận", confirmed: "Đã xác nhận", paid: "Đã thanh toán",
  shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  await ensureOrderTables();
  const order = (await query<Order>("select * from orders where id=$1 limit 1", [id])).rows[0];
  if (!order) notFound();
  const items = (await query<OrderItem>("select * from order_items where order_id=$1 order by id", [id])).rows;
  return (
    <>
      <Link className={styles.back} href="/admin/don-hang">← Danh sách đơn hàng</Link>
      <div className={styles.title}><div><h1>Đơn hàng {order.order_code}</h1><p>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(order.created_at))}</p></div>
        <form action={updateOrderStatus}><input type="hidden" name="id" value={order.id}/><select name="status" defaultValue={order.status}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="primary">Cập nhật</button></form>
      </div>
      <div className={styles.grid}>
        <section><h2>Sản phẩm</h2>{items.map((item)=><article key={item.id}><Image src={item.image_url} alt={item.product_name} width={75} height={65}/><div><strong>{item.product_name}</strong><small>{currency.format(item.unit_price)} × {item.quantity}</small></div><b>{currency.format(item.line_total)}</b></article>)}<div className={styles.total}>Tổng thanh toán <strong>{currency.format(order.total_amount)}</strong></div></section>
        <aside><h2>Thông tin khách hàng</h2><dl><div><dt>Họ tên</dt><dd>{order.customer_name}</dd></div><div><dt>Điện thoại</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div><div><dt>Email</dt><dd>{order.email || "Không có"}</dd></div><div><dt>Tỉnh/Thành</dt><dd>{order.province}</dd></div><div><dt>Địa chỉ</dt><dd>{order.address}</dd></div><div><dt>Ghi chú</dt><dd>{order.note || "Không có"}</dd></div></dl>
          <h2>Thanh toán</h2><p>Chuyển khoản</p><p><strong>CÔNG TY TNHH TIN HỌC ĐÔNG DU</strong><br/>STK: 5691811486<br/>Ngân Hàng Quân Đội - Chi Nhánh Khánh Hội</p>
        </aside>
      </div>
    </>
  );
}
