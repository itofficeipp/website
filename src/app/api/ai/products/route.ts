import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAiAuthorized } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { categories, normalizeCategory } from "@/lib/categories";
import { inferProductType } from "@/lib/productTypes";

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

function parseSpecifications(value: unknown) {
  if (!value) return {};

  if (typeof value === "string") {
    const specs: Record<string, string> = {};

    for (const line of value.split(/\r?\n/)) {
      const separator = line.indexOf(":");
      if (separator < 1) continue;

      const key = text(line.slice(0, separator), 100);
      const itemValue = text(line.slice(separator + 1), 300);

      if (key && itemValue) specs[key] = itemValue;
    }

    return specs;
  }

  if (typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 50)
      .map(([key, item]) => [text(key, 100), text(item, 300)])
      .filter(([key, item]) => key && item),
  );
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

  const name = text(body.name, 220);
  const category = text(body.category, 100);
  const productType = nullableText(body.product_type, 120);

  const categoryMatch = categories.find(
    (c) => normalizeCategory(c.label) === normalizeCategory(category) || c.slug === normalizeCategory(category),
  );
  if (!categoryMatch) {
    console.warn(`[api/ai/products] Category khong khop danh muc chuan: "${category}"`);
  }
  const inferredType = categoryMatch && productType ? inferProductType(categoryMatch.slug, productType) : null;
  const normalizedProductType = inferredType ? inferredType.label : productType;
  const brand = text(body.brand, 100);
  const summary = text(body.summary || body.meta_description, 1000);
  const description = text(body.description, 20_000);
  const imageUrl = text(body.image_url, 2000);
  const badge = nullableText(body.badge, 50);
  const price = Math.round(Number(body.price) || 0);
  const oldPriceValue = Math.round(Number(body.old_price) || 0);
  const oldPrice = oldPriceValue >= price && oldPriceValue > 0 ? oldPriceValue : null;
  const stock = Math.max(0, Math.min(1_000_000, Math.floor(Number(body.stock) || 0)));
  const published = parseBoolean(body.published, false);

  if (
    name.length < 5 ||
    !category ||
    !brand ||
    summary.length < 10 ||
    description.length < 30 ||
    price < 1
  ) {
    return NextResponse.json(
      { error: "Thiếu tên, danh mục, thương hiệu, mô tả hoặc giá bán hợp lệ." },
      { status: 422 },
    );
  }

  if (!isValidHttpsUrl(imageUrl)) {
    return NextResponse.json({ error: "image_url phải là URL HTTPS hợp lệ." }, { status: 422 });
  }

  const baseSlug = slugify(text(body.slug || name, 220)) || `san-pham-${Date.now()}`;
  const duplicate = await query("select 1 from products where slug=$1 limit 1", [baseSlug]);
  const slug = duplicate.rows.length ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;

  const metaTitle = text(body.meta_title || name, 250);
  const metaDescription = text(body.meta_description || summary, 500);
  const focusKeyword = text(body.focus_keyword || name, 200);
  const canonicalUrl = nullableText(body.canonical_url, 2000);
  const ogTitle = text(body.og_title || metaTitle, 250);
  const ogDescription = text(body.og_description || metaDescription, 500);
  const ogImageUrl = text(body.og_image_url || imageUrl, 2000);
  const imageAlt = text(body.image_alt || name, 250);
  const imageCaption = nullableText(body.image_caption, 500);
  const tags = parseTags(body.tags);
  const robotsIndex = parseBoolean(body.robots_index, true);
  const robotsFollow = parseBoolean(body.robots_follow, true);

  if (!isValidHttpsUrl(ogImageUrl)) {
    return NextResponse.json({ error: "og_image_url phải là URL HTTPS hợp lệ." }, { status: 422 });
  }

  const result = await query<{ id: number; slug: string }>(
    `insert into products
      (
        slug,
        name,
        category,
        product_type,
        brand,
        summary,
        description,
        specifications,
        price,
        old_price,
        image_url,
        badge,
        stock,
        published,
        meta_title,
        meta_description,
        focus_keyword,
        canonical_url,
        og_title,
        og_description,
        og_image_url,
        image_alt,
        image_caption,
        tags,
        robots_index,
        robots_follow
      )
     values
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26
      )
     returning id,slug`,
    [
      slug,
      name,
      category,
      normalizedProductType,
      brand,
      summary,
      description,
      parseSpecifications(body.specifications),
      price,
      oldPrice,
      imageUrl,
      badge,
      stock,
      published,
      metaTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageUrl,
      imageAlt,
      imageCaption,
      tags,
      robotsIndex,
      robotsFollow,
    ],
  );

  attempts.set(ip, [...recent, now]);

  revalidatePath("/admin/san-pham");
  revalidatePath("/san-pham");
  revalidatePath("/sitemap.xml");

  if (published) {
    revalidatePath(`/san-pham/${slug}`);
  }

  return NextResponse.json(
    {
      ...result.rows[0],
      published,
      status: published ? "visible" : "hidden",
      message: published
        ? "Đã tạo và hiển thị sản phẩm từ n8n."
        : "Đã tạo sản phẩm ẩn, chờ quản trị viên kiểm tra và hiển thị.",
    },
    { status: 201 },
  );
}
