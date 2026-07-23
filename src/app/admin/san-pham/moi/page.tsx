import { createProduct } from "@/app/admin/san-pham/actions";
import { AdminProductForm } from "@/components/AdminProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <><h1>Thêm sản phẩm</h1><AdminProductForm action={createProduct} error={(await searchParams).error}/></>;
}
