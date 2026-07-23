import Image from "next/image";
import Link from "next/link";
import { deleteProduct, toggleProductVisibility } from "@/app/admin/san-pham/actions";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";
import { currency } from "@/lib/utils";
import styles from "./products.module.css";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  created: "Đã thêm sản phẩm.",
  updated: "Đã cập nhật sản phẩm.",
  visibility: "Đã cập nhật trạng thái hiển thị.",
  deleted: "Đã xóa sản phẩm.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; q?: string }>;
}) {
  const params = await searchParams;
  const keyword = String(params.q || "").trim();
  const products = (await query<Product>(
    `select * from products
     where ($1='' or concat_ws(' ',name,brand,category,slug) ilike $2)
     order by updated_at desc`,
    [keyword, `%${keyword}%`],
  )).rows;
  return (
    <>
      <div className={styles.heading}>
        <div><h1>Quản lý sản phẩm</h1><p>{products.length} sản phẩm.</p></div>
        <Link className="primary" href="/admin/san-pham/moi">Thêm sản phẩm</Link>
      </div>
      {params.message && <p className={styles.success}>{messages[params.message] || "Đã cập nhật sản phẩm."}</p>}
      <form className={styles.search}><input name="q" defaultValue={keyword} placeholder="Tìm theo tên, hãng, danh mục..." /><button className="secondary">Tìm kiếm</button></form>
      {products.length ? <table className="adminTable">
        <thead><tr><th>Sản phẩm</th><th>Giá</th><th>Kho</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{products.map((product) => <tr key={product.id}>
          <td><div className={styles.product}><Image src={product.image_url} alt="" width={58} height={50}/><span><strong>{product.name}</strong><small>{product.brand} • {product.category}</small></span></div></td>
          <td><strong>{currency.format(product.price)}</strong>{product.old_price && <><br/><small><del>{currency.format(product.old_price)}</del></small></>}</td>
          <td>{product.stock}</td>
          <td><span className={product.published ? styles.visible : styles.hidden}>{product.published ? "Đang bán" : "Đang ẩn"}</span></td>
          <td className="formActions">
            <Link className="secondary" href={`/admin/san-pham/${product.id}/sua`}>Sửa</Link>
            <form action={toggleProductVisibility}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="published" value={product.published ? "false" : "true"}/><button className="secondary">{product.published ? "Ẩn" : "Hiện"}</button></form>
            <DeleteProductButton action={deleteProduct} productId={product.id} productName={product.name} />
          </td>
        </tr>)}</tbody>
      </table> : <div className={styles.empty}>Không tìm thấy sản phẩm.</div>}
    </>
  );
}
