import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type SearchProduct = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  summary: string;
  price: number;
  image_url: string;
};

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) || "";
  if (keyword.length < 2) return NextResponse.json({ products: [] });

  const result = await query<SearchProduct>(
    `select id, slug, name, brand, summary, price, image_url
     from products
     where published = true
       and concat_ws(' ', name, brand, category, summary) ilike $1
     order by case when name ilike $2 then 0 else 1 end, updated_at desc
     limit 6`,
    [`%${keyword}%`, `${keyword}%`],
  );

  return NextResponse.json(
    { products: result.rows },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
