export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string;
  summary: string;
  description: string;
  specifications: Record<string, string>;
  price: number;
  old_price: number | null;
  image_url: string;
  badge: string | null;
  stock: number;
  published: boolean;
  updated_at: string;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  status: "draft" | "published";
  author: string;
  source: "manual" | "ai";
  published_at: string | null;
  updated_at: string;
};
