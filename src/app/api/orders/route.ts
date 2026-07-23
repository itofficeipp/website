import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureOrderTables } from "@/lib/orders";

type RequestedItem = { id?: unknown; quantity?: unknown };
const attempts = new Map<string, number[]>();

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 10 * 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Bạn đã gửi quá nhiều đơn hàng. Vui lòng thử lại sau." }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }

  const customerName = clean(body.customerName, 150);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 30).replace(/[^\d+().\s-]/g, "");
  const province = clean(body.province, 100);
  const address = clean(body.address, 500);
  const note = clean(body.note, 1000);
  const requestedItems = Array.isArray(body.items) ? body.items as RequestedItem[] : [];

  if (customerName.length < 2 || phone.replace(/\D/g, "").length < 9 || !province || address.length < 5) {
    return NextResponse.json({ error: "Vui lòng nhập đầy đủ họ tên, số điện thoại, tỉnh/thành và địa chỉ." }, { status: 422 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Địa chỉ email không hợp lệ." }, { status: 422 });
  }

  const quantities = new Map<number, number>();
  for (const item of requestedItems.slice(0, 50)) {
    const id = Number(item.id);
    const quantity = Math.min(99, Math.max(1, Number(item.quantity) || 1));
    if (Number.isInteger(id) && id > 0) quantities.set(id, Math.min(99, (quantities.get(id) || 0) + quantity));
  }
  if (!quantities.size) return NextResponse.json({ error: "Giỏ hàng không có sản phẩm." }, { status: 422 });

  await ensureOrderTables();
  const client = await db.connect();
  try {
    await client.query("begin");
    const ids = [...quantities.keys()];
    const products = await client.query<{ id: number; slug: string; name: string; price: number; image_url: string; stock: number }>(
      "select id,slug,name,price,image_url,stock from products where published=true and id = any($1::int[]) for share",
      [ids],
    );
    if (products.rows.length !== ids.length) throw new Error("PRODUCT_MISSING");

    let total = 0;
    for (const product of products.rows) {
      const quantity = quantities.get(product.id) || 1;
      if (product.stock < quantity) throw new Error(`OUT_OF_STOCK:${product.name}`);
      total += Number(product.price) * quantity;
    }

    const orderCode = `DD${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = await client.query<{ id: string }>(
      `insert into orders (order_code,customer_name,email,phone,province,address,note,payment_method,status,total_amount)
       values ($1,$2,$3,$4,$5,$6,$7,'bank_transfer','pending',$8) returning id`,
      [orderCode, customerName, email || null, phone, province, address, note || null, total],
    );
    for (const product of products.rows) {
      const quantity = quantities.get(product.id) || 1;
      await client.query(
        `insert into order_items (order_id,product_id,product_name,product_slug,image_url,unit_price,quantity,line_total)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [order.rows[0].id, product.id, product.name, product.slug, product.image_url, product.price, quantity, Number(product.price) * quantity],
      );
    }
    await client.query("commit");
    attempts.set(ip, [...recent, now]);
    return NextResponse.json({ orderCode, total }, { status: 201 });
  } catch (error) {
    await client.query("rollback");
    const message = error instanceof Error ? error.message : "";
    if (message === "PRODUCT_MISSING") return NextResponse.json({ error: "Một sản phẩm không còn khả dụng." }, { status: 409 });
    if (message.startsWith("OUT_OF_STOCK:")) return NextResponse.json({ error: `${message.slice(13)} không đủ số lượng tồn kho.` }, { status: 409 });
    console.error("Create order failed", error);
    return NextResponse.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại." }, { status: 500 });
  } finally {
    client.release();
  }
}
