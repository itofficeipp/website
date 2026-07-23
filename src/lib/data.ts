import { query } from "@/lib/db";
import type { Post, Product } from "@/lib/types";

export async function getProducts(limit?: number) {
  const result = await query<Product>(
    `select * from products where published = true order by updated_at desc${limit ? " limit $1" : ""}`,
    limit ? [limit] : [],
  );
  return result.rows;
}

export async function getProduct(slug: string) {
  const result = await query<Product>(
    "select * from products where slug = $1 and published = true limit 1",
    [slug],
  );
  return result.rows[0] ?? null;
}

export async function getPublishedPosts(limit?: number) {
  const result = await query<Post>(
    `select * from posts where status = 'published' order by published_at desc nulls last${limit ? " limit $1" : ""}`,
    limit ? [limit] : [],
  );
  return result.rows;
}

export async function getPost(slug: string) {
  const result = await query<Post>(
    "select * from posts where slug = $1 and status = 'published' limit 1",
    [slug],
  );
  return result.rows[0] ?? null;
}
