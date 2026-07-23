import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; password?: string }>;
}) {
  if (await getSession()) redirect("/admin");
  const params = await searchParams;
  return (
    <main className="loginPage">
      <section className="loginCard">
        <Image src="/logo-dong-du.svg" alt="Tin Học Đông Du" width={180} height={70} />
        <h1>Đăng nhập quản trị</h1>
        {params.password === "changed" && <p style={{ padding: 10, borderRadius: 6, background: "#e8f7ec", color: "#08752e", fontSize: 12 }}>Đã đổi mật khẩu. Vui lòng đăng nhập lại.</p>}
        {params.error && <p className="error">{params.error === "locked" ? "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút." : "Tên đăng nhập hoặc mật khẩu không đúng."}</p>}
        <form action="/api/auth/login" method="post">
          <label>Tên đăng nhập<input name="username" autoComplete="username" required /></label>
          <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary">Đăng nhập</button>
        </form>
      </section>
    </main>
  );
}
