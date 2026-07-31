"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  if (!(await getSession())) redirect("/dang-nhap-quan-tri");
}

function parseSpecifications(value: string) {
  const specifications: Record<string, string> = {};

  for (const line of value.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim().slice(0, 100);
    const itemValue = line.slice(separator + 1).trim().slice(0, 300);

    if (key && itemValue) specifications[key] = itemValue;
  }

  return specifications;
}

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function nullableText(form: FormData, key: string) {
  const value = text(form, key);
  return value || null;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productPayload(form: FormData) {
  const name = text(form, "name");
  const price = Math.max(0, Math.round(Number(form.get("price")) || 0));
  const oldPriceValue = Math.round(Number(form.get("old_price")) || 0);
  const summary = text(form, "summary");
  const imageUrl = text(form, "image_url");

  const metaTitle = text(form, "meta_title") || name;
  const metaDescription = text(form, "meta_description") || summary;

  return {
    name,
    slug: slugify(String(form.get("slug") || name)),
    category: text(form, "category"),
    productType: nullableText(form, "product_type"),
    brand: text(form, "brand"),
    summary,
    description: text(form, "description"),
    specifications: parseSpecifications(String(form.get("specifications") || "")),
    price,
    oldPrice: oldPriceValue >= price && oldPriceValue > 0 ? oldPriceValue : null,
    imageUrl,
    badge: nullableText(form, "badge"),
    stock: Math.max(0, Math.floor(Number(form.get("stock")) || 0)),
    published: form.get("published") === "true",

    metaTitle,
    metaDescription,
    focusKeyword: text(form, "focus_keyword") || name,
    canonicalUrl: nullableText(form, "canonical_url"),
    ogTitle: text(form, "og_title") || metaTitle,
    ogDescription: text(form, "og_description") || metaDescription,
    ogImageUrl: text(form, "og_image_url") || imageUrl,
    imageAlt: text(form, "image_alt") || name,
    imageCaption: nullableText(form, "image_caption"),
    tags: parseTags(text(form, "tags")),
    robotsIndex: form.get("robots_index") !== "false",
    robotsFollow: form.get("robots_follow") !== "false",
  };
}

function refreshProducts(slug?: string) {
  revalidatePath("/");
  revalidatePath("/san-pham");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/san-pham");

  if (slug) {
    revalidatePath(`/san-pham/${slug}`);
  }
}

export async function createProduct(form: FormData) {
  await requireAdmin();

  const product = productPayload(form);

  if (
    !product.name ||
    !product.slug ||
    !product.category ||
    !product.brand ||
    !product.summary ||
    !product.description ||
    !product.imageUrl ||
    product.price < 1
  ) {
    redirect("/admin/san-pham/moi?error=required");
  }

  const exists = await query("select 1 from products where slug=$1", [product.slug]);
  if (exists.rows.length) redirect("/admin/san-pham/moi?error=slug");

  await query(
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
      )`,
    [
      product.slug,
      product.name,
      product.category,
      product.productType,
      product.brand,
      product.summary,
      product.description,
      product.specifications,
      product.price,
      product.oldPrice,
      product.imageUrl,
      product.badge,
      product.stock,
      product.published,
      product.metaTitle,
      product.metaDescription,
      product.focusKeyword,
      product.canonicalUrl,
      product.ogTitle,
      product.ogDescription,
      product.ogImageUrl,
      product.imageAlt,
      product.imageCaption,
      product.tags,
      product.robotsIndex,
      product.robotsFollow,
    ],
  );

  refreshProducts(product.slug);
  redirect("/admin/san-pham?message=created");
}

export async function updateProduct(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));
  const product = productPayload(form);

  if (
    !Number.isInteger(id) ||
    !product.name ||
    !product.slug ||
    !product.category ||
    !product.brand ||
    !product.summary ||
    !product.description ||
    !product.imageUrl ||
    product.price < 1
  ) {
    redirect(`/admin/san-pham/${id}/sua?error=required`);
  }

  const duplicate = await query("select 1 from products where slug=$1 and id<>$2", [
    product.slug,
    id,
  ]);
  if (duplicate.rows.length) redirect(`/admin/san-pham/${id}/sua?error=slug`);

  const previous = await query<{ slug: string }>("select slug from products where id=$1", [id]);

  await query(
    `update products set
      slug=$1,
      name=$2,
      category=$3,
      product_type=$4,
      brand=$5,
      summary=$6,
      description=$7,
      specifications=$8,
      price=$9,
      old_price=$10,
      image_url=$11,
      badge=$12,
      stock=$13,
      published=$14,
      meta_title=$15,
      meta_description=$16,
      focus_keyword=$17,
      canonical_url=$18,
      og_title=$19,
      og_description=$20,
      og_image_url=$21,
      image_alt=$22,
      image_caption=$23,
      tags=$24,
      robots_index=$25,
      robots_follow=$26,
      updated_at=now()
     where id=$27`,
    [
      product.slug,
      product.name,
      product.category,
      product.productType,
      product.brand,
      product.summary,
      product.description,
      product.specifications,
      product.price,
      product.oldPrice,
      product.imageUrl,
      product.badge,
      product.stock,
      product.published,
      product.metaTitle,
      product.metaDescription,
      product.focusKeyword,
      product.canonicalUrl,
      product.ogTitle,
      product.ogDescription,
      product.ogImageUrl,
      product.imageAlt,
      product.imageCaption,
      product.tags,
      product.robotsIndex,
      product.robotsFollow,
      id,
    ],
  );

  refreshProducts(product.slug);

  if (previous.rows[0]?.slug && previous.rows[0].slug !== product.slug) {
    refreshProducts(previous.rows[0].slug);
  }

  redirect("/admin/san-pham?message=updated");
}

export async function toggleProductVisibility(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));
  const published = form.get("published") === "true";

  if (Number.isInteger(id)) {
    const result = await query<{ slug: string }>(
      "update products set published=$1, updated_at=now() where id=$2 returning slug",
      [published, id],
    );

    refreshProducts(result.rows[0]?.slug);
  }

  redirect("/admin/san-pham?message=visibility");
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) redirect("/admin/san-pham");

  const result = await query<{ slug: string }>(
    "delete from products where id=$1 returning slug",
    [id],
  );

  refreshProducts(result.rows[0]?.slug);
  redirect("/admin/san-pham?message=deleted");
}
