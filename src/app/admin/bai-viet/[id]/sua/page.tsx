import { notFound } from "next/navigation";
import { updatePost } from "@/app/admin/actions";
import AdminPostForm from "@/components/AdminPostForm";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type PostRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  featured_image_alt: string | null;
  featured_image_caption: string | null;
  tags: string[] | null;
  robots_index: boolean | null;
  robots_follow: boolean | null;
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  const result = await query<PostRow>(
    `select
      id,
      slug,
      title,
      category,
      excerpt,
      content,
      image_url,
      status,
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
      robots_index,
      robots_follow
    from posts
    where id = $1
    limit 1`,
    [postId],
  );

  const post = result.rows[0];

  if (!post) {
    notFound();
  }

  return <AdminPostForm action={updatePost} post={post} mode="edit" />;
}
