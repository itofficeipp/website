import type { Product } from "@/lib/types";

const errors: Record<string, string> = {
  required: "Vui lòng nhập đầy đủ các trường bắt buộc và giá bán lớn hơn 0.",
  slug: "Đường dẫn sản phẩm đã được sử dụng.",
};

export function AdminProductForm({
  action,
  product,
  error,
}: {
  action: (form: FormData) => void | Promise<void>;
  product?: Product;
  error?: string;
}) {
  const specifications = product
    ? Object.entries(product.specifications || {}).map(([key, value]) => `${key}: ${value}`).join("\n")
    : "";
  return (
    <>
      {error && <p className="error">{errors[error] || "Không thể lưu sản phẩm."}</p>}
      <form action={action} className="formGrid">
        {product && <input type="hidden" name="id" value={product.id}/>}
        <label>Tên sản phẩm *<input name="name" defaultValue={product?.name} required /></label>
        <label>Đường dẫn SEO<input name="slug" defaultValue={product?.slug} placeholder="Để trống sẽ tự tạo từ tên" /></label>
        <div className="formActions">
          <label style={{flex:1}}>Danh mục *
            <input name="category" list="product-categories" defaultValue={product?.category} placeholder="Chọn hoặc nhập danh mục" required />
            <datalist id="product-categories">
              <option value="Laptop" />
              <option value="PC & Linh kiện" />
              <option value="Màn hình" />
              <option value="Máy in" />
              <option value="Camera" />
              <option value="Thiết bị mạng" />
              <option value="Dịch vụ bảo trì doanh nghiệp" />
            </datalist>
          </label>
          <label style={{flex:1}}>Thương hiệu *<input name="brand" defaultValue={product?.brand} required /></label>
        </div>
        <label>Mô tả ngắn *<textarea name="summary" defaultValue={product?.summary} rows={3} required /></label>
        <label>Mô tả chi tiết *<textarea name="description" defaultValue={product?.description} required /></label>
        <label>Thông số kỹ thuật<textarea name="specifications" defaultValue={specifications} placeholder={"CPU: Intel Core i7\nRAM: 16GB\nLưu trữ: 512GB SSD"} /></label>
        <div className="formActions">
          <label style={{flex:1}}>Giá bán *<input name="price" type="number" min="1" step="1" defaultValue={product?.price} required /></label>
          <label style={{flex:1}}>Giá cũ<input name="old_price" type="number" min="0" step="1" defaultValue={product?.old_price || ""} /></label>
          <label style={{flex:1}}>Tồn kho<input name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} /></label>
        </div>
        <label>URL hình ảnh *<input name="image_url" type="url" defaultValue={product?.image_url} required /></label>
        <label>Nhãn sản phẩm<input name="badge" defaultValue={product?.badge || ""} placeholder="Mới, Bán chạy, Giảm 10%..." /></label>
        <label>Trạng thái<select name="published" defaultValue={product?.published ? "true" : "false"}><option value="true">Đang hiển thị</option><option value="false">Đang ẩn</option></select></label>

        <section className="adminSection">
          <h2>Thiết lập SEO</h2>

          <label>Focus Keyword
            <input name="focus_keyword" defaultValue={(product as any)?.focus_keyword || product?.name || ""} placeholder="Từ khóa chính của sản phẩm" />
          </label>

          <label>Meta Title
            <input name="meta_title" defaultValue={(product as any)?.meta_title || product?.name || ""} placeholder="Tiêu đề SEO hiển thị trên Google" />
          </label>

          <label>Meta Description
            <textarea name="meta_description" defaultValue={(product as any)?.meta_description || product?.summary || ""} rows={4} placeholder="Mô tả SEO 140-160 ký tự" />
          </label>

          <label>Canonical URL
            <input name="canonical_url" defaultValue={(product as any)?.canonical_url || ""} placeholder="Để trống nếu dùng URL mặc định" />
          </label>

          <div className="formGrid two">
            <label>Robots Index
              <select name="robots_index" defaultValue={(product as any)?.robots_index === false ? "false" : "true"}>
                <option value="true">index</option>
                <option value="false">noindex</option>
              </select>
            </label>

            <label>Robots Follow
              <select name="robots_follow" defaultValue={(product as any)?.robots_follow === false ? "false" : "true"}>
                <option value="true">follow</option>
                <option value="false">nofollow</option>
              </select>
            </label>
          </div>
        </section>

        <section className="adminSection">
          <h2>Ảnh & Social</h2>

          <label>Image Alt
            <input name="image_alt" defaultValue={(product as any)?.image_alt || product?.name || ""} placeholder="Mô tả ảnh sản phẩm cho SEO hình ảnh" />
          </label>

          <label>Image Caption
            <input name="image_caption" defaultValue={(product as any)?.image_caption || ""} placeholder="Chú thích ảnh nếu cần" />
          </label>

          <label>Tags
            <input name="tags" defaultValue={Array.isArray((product as any)?.tags) ? (product as any).tags.join(", ") : ""} placeholder="laptop, máy in, phụ kiện" />
          </label>

          <label>OG Title
            <input name="og_title" defaultValue={(product as any)?.og_title || (product as any)?.meta_title || product?.name || ""} />
          </label>

          <label>OG Description
            <textarea name="og_description" defaultValue={(product as any)?.og_description || (product as any)?.meta_description || product?.summary || ""} rows={3} />
          </label>

          <label>OG Image URL
            <input name="og_image_url" defaultValue={(product as any)?.og_image_url || product?.image_url || ""} />
          </label>
        </section>

        <section className="adminSection">
          <h2>Google Preview</h2>
          <div className="googlePreview">
            <strong>{(product as any)?.meta_title || product?.name || "Tiêu đề SEO"}</strong>
            <span>{(product as any)?.canonical_url || `https://tinhocdongdu.com/san-pham/${product?.slug || "duong-dan-san-pham"}`}</span>
            <p>{(product as any)?.meta_description || product?.summary || "Mô tả SEO sẽ hiển thị tại đây."}</p>
          </div>
        </section>

        <section className="adminSection">
          <h2>Social Preview</h2>
          <div className="socialPreview">
            {((product as any)?.og_image_url || product?.image_url) ? (
              <img src={(product as any)?.og_image_url || product?.image_url} alt={(product as any)?.image_alt || product?.name || "Social preview"} />
            ) : null}
            <div>
              <strong>{(product as any)?.og_title || (product as any)?.meta_title || product?.name || "Tiêu đề chia sẻ"}</strong>
              <p>{(product as any)?.og_description || (product as any)?.meta_description || product?.summary || "Mô tả chia sẻ"}</p>
              <small>tinhocdongdu.com</small>
            </div>
          </div>
        </section>

        <section className="adminSection">
          <h2>SEO Checklist</h2>
          <ul className="seoChecklist">
            <li className={((product as any)?.meta_title || product?.name) ? "ok" : "warn"}>Có Meta Title</li>
            <li className={((product as any)?.meta_description || product?.summary) ? "ok" : "warn"}>Có Meta Description</li>
            <li className={((product as any)?.focus_keyword || product?.name) ? "ok" : "warn"}>Có Focus Keyword</li>
            <li className={((product as any)?.image_alt || product?.name) ? "ok" : "warn"}>Ảnh có Alt Text</li>
          </ul>
        </section>

        <div className="formActions"><button className="primary">Lưu sản phẩm</button></div>
      </form>
    </>
  );
}
