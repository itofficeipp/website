"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { getAdminPasswordHash, saveAdminPasswordHash } from "@/lib/admin-credentials";

export async function changePassword(form: FormData) {
  const session = await getSession();
  if (!session) redirect("/dang-nhap-quan-tri");

  const username = String(session.username || process.env.ADMIN_USER || "admin");
  const currentPassword = String(form.get("currentPassword") || "");
  const newPassword = String(form.get("newPassword") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");
  const currentHash = await getAdminPasswordHash(username);

  if (!(await bcrypt.compare(currentPassword, currentHash))) {
    redirect("/admin/doi-mat-khau?error=current");
  }
  if (newPassword.length < 10 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    redirect("/admin/doi-mat-khau?error=weak");
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/doi-mat-khau?error=confirm");
  }
  if (await bcrypt.compare(newPassword, currentHash)) {
    redirect("/admin/doi-mat-khau?error=same");
  }

  await saveAdminPasswordHash(username, await bcrypt.hash(newPassword, 12));
  await destroySession();
  redirect("/dang-nhap-quan-tri?password=changed");
}
