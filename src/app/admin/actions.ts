"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  if (!(await getSession())) redirect("/dang-nhap-quan-tri");
}

function refreshPosts() {
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  revalidatePath("/admin");
  revalidatePath("/admin/bai-nhap");
  revalidatePath("/admin/dang-bai");
  revalidatePath("/sitemap.xml");
}

function text(form: FormData, name: string, max = 9999) {
  return String(form.get(name) || "").trim().slice(0, max);
}

function nullableText(form: FormData, name: string, max = 9999) {
  const value = text(form, name, max);
  return value || null;
}

function parseBoolean(form: FormData, name: string, defaultValue = true) {
  const value = form.get(name);

  if (value === null) return defaultValue;

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }

  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }

  return defaultValue;
}

function parseTags(form: FormData) {
  return text(form, "tags", 2000)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function getPostSeoPayload(form: FormData, title: string, excerpt: string, imageUrl: string | null) {
  const metaTitle = text(form, "meta_title", 250) || title;
  const metaDescription = text(form, "meta_description", 500) || excerpt;
  const focusKeyword = text(form, "focus_keyword", 200) || title;
  const canonicalUrl = nullableText(form, "canonical_url", 2000);
  const ogTitle = text(form, "og_title", 250) || metaTitle;
  const ogDescription = text(form, "og_description", 500) || metaDescription;
  const ogImageUrl = nullableText(form, "og_image_url", 2000) || imageUrl;
  const featuredImageAlt = text(form, "featured_image_alt", 250) || title;
  const featuredImageCaption = nullableText(form, "featured_image_caption", 500);
  const tags = parseTags(form);
  const robotsIndex = parseBoolean(form, "robots_index", true);
  const robotsFollow = parseBoolean(form, "robots_follow", true);
  const authorName = "Quản trị viên";

  return {
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
    robotsIndex,
    robotsFollow,
    authorName,
  };
}

export async function createPost(form: FormData) {
  await requireAdmin();

  const title = text(form, "title", 250);
  const content = text(form, "content", 50000);
  const excerpt = text(form, "excerpt", 2000) || text(form, "meta_description", 500);
  const imageUrl = nullableText(form, "image_url", 2000);

  if (!title || !content || !excerpt) redirect("/admin/dang-bai?error=required");

  const status = form.get("status") === "published" ? "published" : "draft";
  const baseSlug = slugify(String(form.get("slug") || title)) || `bai-viet-${Date.now()}`;

  const existing = await query<{ id: number }>("select id from posts where slug=$1 limit 1", [baseSlug]);
  const slug = existing.rows.length ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;

  const seo = getPostSeoPayload(form, title, excerpt, imageUrl);

  await query(
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
        published_at,
        source,
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
        $1,$2,$3,$4,$5,$6,$7,'Quản trị viên',
        case when $7='published' then now() else null end,
        'manual',
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )`,
    [
      slug,
      title,
      text(form, "category", 100) || "Tin công nghệ",
      excerpt,
      content,
      imageUrl,
      status,
      seo.metaTitle,
      seo.metaDescription,
      seo.focusKeyword,
      seo.canonicalUrl,
      seo.ogTitle,
      seo.ogDescription,
      seo.ogImageUrl,
      seo.featuredImageAlt,
      seo.featuredImageCaption,
      seo.tags,
      seo.authorName,
      seo.robotsIndex,
      seo.robotsFollow,
    ],
  );

  refreshPosts();
  redirect(status === "published" ? "/admin?message=published" : "/admin/bai-nhap?message=saved");
}

export async function publishPost(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));

  if (Number.isInteger(id)) {
    await query(
      "update posts set status='published',published_at=coalesce(published_at,now()),updated_at=now() where id=$1",
      [id],
    );
  }

  refreshPosts();
  redirect("/admin?message=published");
}

export async function unpublishPost(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));

  if (Number.isInteger(id)) {
    await query(
      "update posts set status='draft',published_at=null,updated_at=now() where id=$1",
      [id],
    );
  }

  refreshPosts();
  redirect("/admin/bai-nhap?message=unpublished");
}

export async function deletePost(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));

  if (Number.isInteger(id)) {
    await query("delete from posts where id=$1", [id]);
  }

  refreshPosts();
  redirect("/admin/bai-nhap?message=deleted");
}

export async function updatePost(form: FormData) {
  await requireAdmin();

  const id = Number(form.get("id"));
  const title = text(form, "title", 250);
  const content = text(form, "content", 50000);
  const excerpt = text(form, "excerpt", 2000) || text(form, "meta_description", 500);
  const imageUrl = nullableText(form, "image_url", 2000);

  if (!Number.isInteger(id) || !title || !content || !excerpt) {
    redirect("/admin/bai-nhap?message=required");
  }

  const status = form.get("status") === "published" ? "published" : "draft";
  const baseSlug = slugify(String(form.get("slug") || title)) || `bai-viet-${id}`;

  const existing = await query<{ id: number }>(
    "select id from posts where slug=$1 and id<>$2 limit 1",
    [baseSlug, id],
  );

  const slug = existing.rows.length ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;
  const seo = getPostSeoPayload(form, title, excerpt, imageUrl);

  await query(
    `update posts
     set slug=$1,
         title=$2,
         category=$3,
         excerpt=$4,
         content=$5,
         image_url=$6,
         status=$7,
         meta_title=$8,
         meta_description=$9,
         focus_keyword=$10,
         canonical_url=$11,
         og_title=$12,
         og_description=$13,
         og_image_url=$14,
         featured_image_alt=$15,
         featured_image_caption=$16,
         tags=$17,
         author_name=$18,
         robots_index=$19,
         robots_follow=$20,
         published_at=case when $7='published' then coalesce(published_at, now()) else null end,
         updated_at=now()
     where id=$21`,
    [
      slug,
      title,
      text(form, "category", 100) || "Tin công nghệ",
      excerpt,
      content,
      imageUrl,
      status,
      seo.metaTitle,
      seo.metaDescription,
      seo.focusKeyword,
      seo.canonicalUrl,
      seo.ogTitle,
      seo.ogDescription,
      seo.ogImageUrl,
      seo.featuredImageAlt,
      seo.featuredImageCaption,
      seo.tags,
      seo.authorName,
      seo.robotsIndex,
      seo.robotsFollow,
      id,
    ],
  );

  refreshPosts();
  revalidatePath(`/tin-tuc/${slug}`);

  redirect(status === "published" ? "/admin?message=updated" : "/admin/bai-nhap?message=updated");
}
