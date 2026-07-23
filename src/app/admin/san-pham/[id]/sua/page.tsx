import { notFound } from "next/navigation";
import { updateProduct } from "@/app/admin/san-pham/actions";
import { AdminProductForm } from "@/components/AdminProductForm";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const product = (await query<Product>("select * from products where id=$1 limit 1", [id])).rows[0];
  if (!product) notFound();
  return <><h1>Sửa sản phẩm</h1><AdminProductForm action={updateProduct} product={product} error={(await searchParams).error}/></>;
}
