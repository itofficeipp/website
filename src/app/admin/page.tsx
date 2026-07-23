import Link from "next/link";
import { unpublishPost } from "@/app/admin/actions";
import { query } from "@/lib/db";
import type { Post } from "@/lib/types";
import styles from "./posts.module.css";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  published: "Bài viết đã được đăng.",
  updated: "Đã cập nhật bài viết.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const posts = (
    await query<Post>(
      "select * from posts where status='published' order by published_at desc nulls last",
    )
  ).rows;

  const message = (await searchParams).message;

  return (
    <>
      <div className={styles.heading}>
        <div>
          <h1>Bài đã đăng</h1>
          <p>{posts.length} bài viết đang hiển thị trên website.</p>
        </div>
        <Link className="primary" href="/admin/dang-bai">
          Đăng bài mới
        </Link>
      </div>

      {message && <p className={styles.success}>{messages[message] || "Đã cập nhật bài viết."}</p>}

      {posts.length ? (
        <table className="adminTable">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nguồn</th>
              <th>Ngày đăng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <strong>{post.title}</strong>
                  <br />
                  <small>{post.category}</small>
                </td>
                <td>{post.source === "ai" ? "AI" : post.author}</td>
                <td>
                  {post.published_at
                    ? new Intl.DateTimeFormat("vi-VN").format(new Date(post.published_at))
                    : ""}
                </td>
                <td className="formActions">
                  <Link className="secondary" href={`/admin/bai-viet/${post.id}/sua`}>
                    Sửa
                  </Link>
                  <form action={unpublishPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="secondary">Gỡ bài</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.empty}>Chưa có bài viết nào được đăng.</div>
      )}
    </>
  );
}
