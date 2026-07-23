import Link from "next/link";
import { query } from "@/lib/db";
import { ensureOrderTables, type Order } from "@/lib/orders";
import { currency } from "@/lib/utils";
import styles from "./orders.module.css";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = {
  pending: "Chờ xác nhận", confirmed: "Đã xác nhận", paid: "Đã thanh toán",
  shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy",
};

export default async function OrdersPage() {
  await ensureOrderTables();
  const orders = (await query<Order>("select * from orders order by created_at desc limit 300")).rows;
  return (
    <>
      <div className={styles.heading}><div><h1>Quản lý đơn hàng</h1><p>{orders.length} đơn hàng gần nhất.</p></div><Link href="/admin/don-hang">Làm mới</Link></div>
      {orders.length ? <table className="adminTable"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}>
          <td><Link className={styles.code} href={`/admin/don-hang/${order.id}`}>{order.order_code}</Link></td>
          <td><strong>{order.customer_name}</strong><br/><small>{order.phone}</small></td>
          <td><strong>{currency.format(order.total_amount)}</strong></td>
          <td><span className={`${styles.status} ${styles[order.status]}`}>{labels[order.status] || order.status}</span></td>
          <td>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(order.created_at))}</td>
        </tr>)}</tbody></table> : <div className={styles.noOrders}>Chưa có đơn hàng.</div>}
    </>
  );
}
