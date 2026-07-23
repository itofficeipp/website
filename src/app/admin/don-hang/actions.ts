"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { ensureOrderTables } from "@/lib/orders";

const statuses = new Set(["pending", "confirmed", "paid", "shipping", "completed", "cancelled"]);

export async function updateOrderStatus(form: FormData) {
  if (!(await getSession())) redirect("/dang-nhap-quan-tri");
  const id = Number(form.get("id"));
  const status = String(form.get("status") || "");
  if (!Number.isInteger(id) || !statuses.has(status)) return;
  await ensureOrderTables();
  await query("update orders set status=$1,updated_at=now() where id=$2", [status, id]);
  revalidatePath("/admin/don-hang");
  revalidatePath(`/admin/don-hang/${id}`);
}
