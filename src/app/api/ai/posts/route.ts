import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAiAuthorized } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/utils";

const attempts = new Map<string, number[]>();

function text(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

function nullableText(value: unknown, max: number) {
  const result = text(value, max);
  return result || null;
}

function parseBoolean(value: unknown, defaultValue = true) {
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  return defaultValue;
}

function parseTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item, 60)).filter(Boolean).slice(0, 20);
  }

  return String(value || "")
    .split(",")
    .map((item) => text(item, 60))
    .filter(Boolean)
    .slice(0, 20);
}

function isValidHttpsUrl(value: string | null) {
  if (!value) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAiAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "ai";

  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60_000);

  if (recent.length >= 30) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ." }, { status: 400 });
  }

  const title = text(body.title, 250);
  const excerpt = text(body.excerpt || body.summary || body.meta_description, 2000);
  const content = text(body.content, 50_000);
  const category = text(body.category || "Tin công nghệ", 100);
  const imageUrl = nullableText(body.image_url, 2000);

  if (title.length < 10 || excerpt.length < 20 || content.length < 100) {
    return NextResponse.json({ error: "Nội dung quá ngắn." }, { status: 422 });
  }

  if (!isValidHttpsUrl(imageUrl)) {
    return NextResponse.json({ error: "image_url phải là URL HTTPS hợp lệ." }, { status: 422 });
  }

  const baseSlug = slugify(text(body.slug || title, 220)) || `bai-viet-${Date.now()}`;
  const duplicate = await query("select 1 from posts where slug=$1 limit 1", [baseSlug]);
  const slug = duplicate.rows.length ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;

  const metaTitle = text(body.meta_title || title, 250);
  const metaDescription = text(body.meta_description || excerpt, 500);
  const focusKeyword = text(body.focus_keyword || title, 200);
  const canonicalUrl = nullableText(body.canonical_url, 2000);
  const ogTitle = text(body.og_title || metaTitle, 250);
  const ogDescription = text(body.og_description || metaDescription, 500);
  const ogImageUrl = nullableText(body.og_image_url || imageUrl, 2000);
  const featuredImageAlt = text(body.featured_image_alt || body.image_alt || title, 250);
  const featuredImageCaption = nullableText(body.featured_image_caption || body.image_caption, 500);
  const tags = parseTags(body.tags);
  const robotsIndex = parseBoolean(body.robots_index, true);
  const robotsFollow = parseBoolean(body.robots_follow, true);
  const status = body.status === "published" ? "published" : "draft";
  const publishedAt = status === "published" ? new Date() : null;
  const authorName = text(body.author_name || body.author || "AI Assistant", 100);

  if (!isValidHttpsUrl(ogImageUrl)) {
    return NextResponse.json({ error: "og_image_url phải là URL HTTPS hợp lệ." }, { status: 422 });
  }

  const result = await query<{ id: number; slug: string }>(
    `insert into posts
      (
        slug,
        title,
        category,
        excerpt,
        content,
        image_url,
        status,
        author,
        source,
        published_at,
        meta_title,
        meta_description,
        focus_keyword,
        canonical_url,
        og_title,
        og_description,
        og_image_url,
        featured_image_alt,
        featured_image_caption,
        tags,
        author_name,
        robots_index,
        robots_follow
      )
     values
      (
        $1,$2,$3,$4,$5,$6,$7,$8,'ai',$9,
        $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22
      )
     returning id,slug`,
    [
      slug,
      title,
      category,
      excerpt,
      content,
      imageUrl,
      status,
      authorName,
      publishedAt,
      metaTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageUrl,
      featuredImageAlt,
      featuredImageCaption,
      tags,
      authorName,
      robotsIndex,
      robotsFollow,
    ],
  );

  attempts.set(ip, [...recent, now]);

  revalidatePath("/admin/bai-nhap");
  revalidatePath("/admin");
  revalidatePath("/tin-tuc");
  revalidatePath("/sitemap.xml");

  if (status === "published") {
    revalidatePath(`/tin-tuc/${slug}`);
  }

  return NextResponse.json(
    {
      ...result.rows[0],
      status,
      message:
        status === "published"
          ? "Đã đăng bài viết từ n8n."
          : "Đã tạo bản nháp chờ duyệt.",
    },
    { status: 201 },
  );
}
