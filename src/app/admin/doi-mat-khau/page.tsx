import { changePassword } from "@/app/admin/doi-mat-khau/actions";
import styles from "./page.module.css";

const messages: Record<string, string> = {
  current: "Mật khẩu hiện tại không đúng.",
  weak: "Mật khẩu mới phải có ít nhất 10 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
  confirm: "Hai lần nhập mật khẩu mới không giống nhau.",
  same: "Mật khẩu mới phải khác mật khẩu hiện tại.",
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const error = (await searchParams).error;
  return (
    <>
      <h1>Đổi mật khẩu quản trị</h1>
      <p>Sau khi đổi thành công, hệ thống sẽ đăng xuất để bạn đăng nhập lại.</p>
      {error && <p className="error">{messages[error] || "Không thể đổi mật khẩu."}</p>}
      <form action={changePassword} className={`formGrid ${styles.form}`}>
        <label>Mật khẩu hiện tại<input name="currentPassword" type="password" autoComplete="current-password" required /></label>
        <label>Mật khẩu mới<input name="newPassword" type="password" autoComplete="new-password" minLength={10} required /></label>
        <label>Nhập lại mật khẩu mới<input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required /></label>
        <small className={styles.hint}>Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt.</small>
        <div className="formActions"><button className="primary">Cập nhật mật khẩu</button></div>
      </form>
    </>
  );
}
