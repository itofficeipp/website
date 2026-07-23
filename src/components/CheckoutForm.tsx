"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Building2, CheckCircle2, CreditCard, LoaderCircle, PackageCheck } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import styles from "./CheckoutForm.module.css";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function CheckoutForm() {
  const { items, ready, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<{ orderCode: string; total: number } | null>(null);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          email: form.get("email"),
          phone: form.get("phone"),
          province: form.get("province"),
          address: form.get("address"),
          note: form.get("note"),
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tạo đơn hàng.");
      setCompleted(data);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tạo đơn hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <main className={`section container ${styles.loading}`}><LoaderCircle /> Đang tải giỏ hàng...</main>;
  if (completed) return (
    <main className={`section container ${styles.success}`}>
      <CheckCircle2 /><h1>Đã tiếp nhận đơn hàng</h1>
      <p>Mã đơn hàng của bạn là <strong>{completed.orderCode}</strong>.</p>
      <p>Tổng thanh toán: <strong>{currency.format(completed.total)}</strong></p>
      <div className={styles.bankSuccess}><strong>Nội dung chuyển khoản:</strong> {completed.orderCode}</div>
      <p>Tin Học Đông Du sẽ liên hệ xác nhận đơn hàng qua số điện thoại bạn đã cung cấp.</p>
      <Link href="/san-pham">Tiếp tục xem sản phẩm</Link>
    </main>
  );
  if (!items.length) return (
    <main className={`section container ${styles.empty}`}>
      <PackageCheck /><h1>Giỏ hàng đang trống</h1><p>Hãy thêm sản phẩm trước khi đặt hàng.</p><Link href="/san-pham">Xem sản phẩm</Link>
    </main>
  );

  return (
    <main className={`section container ${styles.checkout}`}>
      <div className={styles.title}><span>ĐẶT HÀNG</span><h1>Thông tin đơn hàng</h1><p>Kiểm tra sản phẩm và nhập thông tin nhận hàng.</p></div>
      <form onSubmit={submit} className={styles.layout}>
        <div className={styles.formPanel}>
          <section>
            <h2>1. Thông tin khách hàng</h2>
            <div className={styles.fields}>
              <label>Họ và tên *<input name="customerName" maxLength={150} required /></label>
              <label>Số điện thoại *<input name="phone" type="tel" maxLength={30} required /></label>
              <label>Email<input name="email" type="email" maxLength={200} /></label>
              <label>Tỉnh/Thành phố *<input name="province" maxLength={100} required /></label>
              <label className={styles.full}>Địa chỉ nhận hàng *<textarea name="address" maxLength={500} required /></label>
              <label className={styles.full}>Ghi chú<textarea name="note" maxLength={1000} /></label>
            </div>
          </section>
          <section>
            <h2>2. Hình thức thanh toán</h2>
            <div className={styles.payment}>
              <div className={styles.paymentTitle}><CreditCard /><strong>Chuyển khoản</strong><CheckCircle2 /></div>
              <p>Vui lòng chuyển khoản theo thông tin dưới đây. Sau khi gửi đơn, dùng mã đơn hàng làm nội dung chuyển khoản.</p>
              <dl>
                <div><dt>Chủ tài khoản</dt><dd>CÔNG TY TNHH TIN HỌC ĐÔNG DU</dd></div>
                <div><dt>Số tài khoản</dt><dd>5691811486</dd></div>
                <div><dt>Ngân hàng</dt><dd>Ngân Hàng Quân Đội - Chi Nhánh Khánh Hội</dd></div>
              </dl>
            </div>
          </section>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.orderButton} disabled={submitting}>{submitting ? <><LoaderCircle /> Đang gửi đơn...</> : "Đặt hàng"}</button>
        </div>
        <aside className={styles.summary}>
          <h2>Sản phẩm đặt mua</h2>
          {items.map((item) => <article key={item.id}>
            <Image src={item.image_url} alt={item.name} width={76} height={66} />
            <div><strong>{item.name}</strong><small>Số lượng: {item.quantity}</small><b>{currency.format(item.price * item.quantity)}</b></div>
          </article>)}
          <div className={styles.total}><span>Tổng thanh toán</span><strong>{currency.format(total)}</strong></div>
          <div className={styles.company}><Building2 /><span><strong>Tin Học Đông Du</strong><small>0918 620 986</small></span></div>
        </aside>
      </form>
    </main>
  );
}
