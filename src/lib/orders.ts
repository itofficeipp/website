import { query } from "@/lib/db";

export async function ensureOrderTables() {
  await query(`
    create table if not exists orders (
      id bigserial primary key,
      order_code varchar(30) unique not null,
      customer_name varchar(150) not null,
      email varchar(200),
      phone varchar(30) not null,
      province varchar(100) not null,
      address text not null,
      note text,
      payment_method varchar(30) not null default 'bank_transfer',
      status varchar(30) not null default 'pending'
        check (status in ('pending','confirmed','paid','shipping','completed','cancelled')),
      total_amount bigint not null check (total_amount >= 0),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table if not exists order_items (
      id bigserial primary key,
      order_id bigint not null references orders(id) on delete cascade,
      product_id integer references products(id) on delete set null,
      product_name varchar(220) not null,
      product_slug varchar(180) not null,
      image_url text not null,
      unit_price bigint not null check (unit_price >= 0),
      quantity integer not null check (quantity > 0),
      line_total bigint not null check (line_total >= 0)
    );
    create index if not exists orders_created_idx on orders(created_at desc);
    create index if not exists order_items_order_idx on order_items(order_id);
  `);
}

export type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  email: string | null;
  phone: string;
  province: string;
  address: string;
  note: string | null;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};
