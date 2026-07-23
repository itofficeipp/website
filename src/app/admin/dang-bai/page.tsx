import { createPost } from "@/app/admin/actions";
import AdminPostForm from "@/components/AdminPostForm";

export default function NewPostPage() {
  return <AdminPostForm action={createPost} mode="create" />;
}
