import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Đặt hàng",
  description: "Nhập thông tin nhận hàng và hoàn tất đơn hàng tại Tin Học Đông Du.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <><SiteHeader /><CheckoutForm /><SiteFooter /></>;
}
