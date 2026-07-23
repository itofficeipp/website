"use client";

import { useMemo, useState } from "react";

type PostData = {
  id?: number;
  title?: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  image_url?: string | null;
  status?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  featured_image_alt?: string | null;
  featured_image_caption?: string | null;
  tags?: string[] | string | null;
  robots_index?: boolean | null;
  robots_follow?: boolean | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  post?: PostData;
  mode?: "create" | "edit";
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function joinTags(tags: PostData["tags"]) {
  if (Array.isArray(tags)) return tags.join(", ");
  return tags || "";
}

export default function AdminPostForm({ action, post, mode = "create" }: Props) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [category, setCategory] = useState(post?.category || "Tin công nghệ");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [imageUrl, setImageUrl] = useState(post?.image_url || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState(post?.status || "draft");

  const [focusKeyword, setFocusKeyword] = useState(post?.focus_keyword || "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url || "");
  const [robotsIndex, setRobotsIndex] = useState(post?.robots_index === false ? "false" : "true");
  const [robotsFollow, setRobotsFollow] = useState(post?.robots_follow === false ? "false" : "true");

  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featured_image_alt || "");
  const [featuredImageCaption, setFeaturedImageCaption] = useState(post?.featured_image_caption || "");
  const [ogTitle, setOgTitle] = useState(post?.og_title || "");
  const [ogDescription, setOgDescription] = useState(post?.og_description || "");
  const [ogImageUrl, setOgImageUrl] = useState(post?.og_image_url || "");
  const [tags, setTags] = useState(joinTags(post?.tags));

  const previewSlug = slug || slugify(title);
  const googleTitle = metaTitle || title || "Tiêu đề bài viết";
  const googleDescription = metaDescription || excerpt || "Mô tả SEO của bài viết sẽ hiển thị tại đây.";
  const socialTitle = ogTitle || googleTitle;
  const socialDescription = ogDescription || googleDescription;
  const socialImage = ogImageUrl || imageUrl;

  const checklist = useMemo(() => {
    const keyword = focusKeyword.trim().toLowerCase();
    const titleText = googleTitle.toLowerCase();
    const descriptionText = googleDescription.toLowerCase();
    const contentText = content.toLowerCase();

    return [
      {
        label: "Có Focus Keyword",
        ok: keyword.length > 0,
      },
      {
        label: "Meta Title có từ khóa chính",
        ok: keyword.length > 0 && titleText.includes(keyword),
      },
      {
        label: "Meta Description có từ khóa chính",
        ok: keyword.length > 0 && descriptionText.includes(keyword),
      },
      {
        label: "Nội dung có từ khóa chính",
        ok: keyword.length > 0 && contentText.includes(keyword),
      },
      {
        label: "Ảnh có Alt Text",
        ok: (featuredImageAlt || title).trim().length > 0,
      },
    ];
  }, [focusKeyword, googleTitle, googleDescription, content, featuredImageAlt, title]);

  return (
    <>
      <h1>{mode === "edit" ? "Sửa bài viết" : "Đăng bài mới"}</h1>

      <form action={action} className="formGrid">
        {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

        <section className="adminSection">
          <h2>Nội dung chính</h2>

          <label>
            Tiêu đề
            <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label>
            Đường dẫn
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Để trống sẽ tự tạo"
            />
          </label>

          <label>
            Chuyên mục
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Tin công nghệ</option>
              <option>Tư vấn</option>
              <option>Kinh nghiệm</option>
              <option>Khuyến mãi</option>
            </select>
          </label>

          <label>
            Mô tả ngắn / Excerpt
            <textarea
              name="excerpt"
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </label>

          <label>
            Ảnh đại diện URL
            <input
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </label>

          <label>
            Nội dung
            <textarea
              name="content"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>

          <label>
            Trạng thái
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Lưu vào Bài nháp</option>
              <option value="published">Đăng ngay</option>
            </select>
          </label>
        </section>

        <section className="adminSection">
          <h2>Thiết lập SEO</h2>

          <label>
            Focus Keyword
            <input
              name="focus_keyword"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="Từ khóa chính của bài viết"
            />
          </label>

          <label>
            Meta Title
            <input
              name="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Tiêu đề SEO hiển thị trên Google"
            />
          </label>

          <label>
            Meta Description
            <textarea
              name="meta_description"
              rows={4}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Mô tả SEO 140-160 ký tự"
            />
          </label>

          <label>
            Canonical URL
            <input
              name="canonical_url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="Để trống nếu dùng URL mặc định"
            />
          </label>

          <div className="formGrid two">
            <label>
              Robots Index
              <select name="robots_index" value={robotsIndex} onChange={(e) => setRobotsIndex(e.target.value)}>
                <option value="true">index</option>
                <option value="false">noindex</option>
              </select>
            </label>

            <label>
              Robots Follow
              <select name="robots_follow" value={robotsFollow} onChange={(e) => setRobotsFollow(e.target.value)}>
                <option value="true">follow</option>
                <option value="false">nofollow</option>
              </select>
            </label>
          </div>
        </section>

        <section className="adminSection">
          <h2>Ảnh đại diện & Social</h2>

          <label>
            Featured Image Alt
            <input
              name="featured_image_alt"
              value={featuredImageAlt}
              onChange={(e) => setFeaturedImageAlt(e.target.value)}
              placeholder="Mô tả ảnh đại diện cho SEO hình ảnh"
            />
          </label>

          <label>
            Featured Image Caption
            <input
              name="featured_image_caption"
              value={featuredImageCaption}
              onChange={(e) => setFeaturedImageCaption(e.target.value)}
              placeholder="Chú thích ảnh nếu cần"
            />
          </label>

          <label>
            OG Title
            <input
              name="og_title"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Tiêu đề khi chia sẻ mạng xã hội"
            />
          </label>

          <label>
            OG Description
            <textarea
              name="og_description"
              rows={3}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Mô tả khi chia sẻ mạng xã hội"
            />
          </label>

          <label>
            OG Image URL
            <input
              name="og_image_url"
              type="url"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="Nếu trống sẽ dùng ảnh đại diện"
            />
          </label>

          <label>
            Tags
            <input
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="laptop, tư vấn, kinh nghiệm"
            />
          </label>
        </section>

        <section className="adminSection">
          <h2>Google Preview</h2>
          <div className="googlePreview">
            <strong>{googleTitle}</strong>
            <span>https://tinhocdongdu.com/tin-tuc/{previewSlug || "duong-dan-bai-viet"}</span>
            <p>{googleDescription}</p>
          </div>
        </section>

        <section className="adminSection">
          <h2>Social Preview</h2>
          <div className="socialPreview">
            {socialImage ? <img src={socialImage} alt={featuredImageAlt || title} /> : <div />}
            <div>
              <strong>{socialTitle}</strong>
              <p>{socialDescription}</p>
              <span>tinhocdongdu.com</span>
            </div>
          </div>
        </section>

        <section className="adminSection">
          <h2>SEO Checklist</h2>
          <ul className="seoChecklist">
            {checklist.map((item) => (
              <li key={item.label} className={item.ok ? "ok" : "warn"}>
                {item.ok ? "Có" : "Thiếu"} {item.label.replace(/^Có /, "")}
              </li>
            ))}
          </ul>
        </section>

        <div className="formActions">
          <button className="primary">{mode === "edit" ? "Cập nhật bài viết" : "Lưu bài viết"}</button>
        </div>
      </form>
    </>
  );
}
