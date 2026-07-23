import Link from "next/link";
import { deletePost, publishPost } from "@/app/admin/actions";
import { query } from "@/lib/db";
import type { Post } from "@/lib/types";
import styles from "../posts.module.css";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Đã lưu bài viết vào bản nháp.",
  unpublished: "Đã gỡ bài và chuyển về bản nháp.",
  deleted: "Đã xóa bài viết.",
  updated: "Đã cập nhật bài viết.",
  required: "Vui lòng nhập đầy đủ tiêu đề và nội dung.",
};

export default async function DraftPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const drafts = (
    await query<Post>("select * from posts where status='draft' order by updated_at desc")
  ).rows;

  const message = (await searchParams).message;

  return (
    <>
      <div className={styles.heading}>
        <div>
          <h1>Bài nháp</h1>
          <p>{drafts.length} bài đang chờ kiểm tra và duyệt đăng. Bài do AI tạo sẽ xuất hiện tại đây.</p>
        </div>
        <Link className="primary" href="/admin/dang-bai">
          Tạo bài nháp
        </Link>
      </div>

      {message && <p className={styles.success}>{messages[message] || "Đã cập nhật bài viết."}</p>}

      {drafts.length ? (
        <table className="adminTable">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nguồn</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((post) => (
              <tr key={post.id}>
                <td>
                  <strong>{post.title}</strong>
                  <br />
                  <small>{post.category}</small>
                </td>
                <td>{post.source === "ai" ? "AI Assistant" : post.author}</td>
                <td>{new Intl.DateTimeFormat("vi-VN").format(new Date(post.updated_at))}</td>
                <td className="formActions"><Link className="secondary" href={"/admin/bai-viet/" + post.id + "/sua"}>Sửa</Link>
                  <Link className="secondary" href={`/admin/bai-viet/${post.id}/sua`}>
                    Sửa
                  </Link>
                  <form action={publishPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="primary">Duyệt đăng</button>
                  </form>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="secondary">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.empty}>Chưa có bài nháp.</div>
      )}
    </>
  );
}
