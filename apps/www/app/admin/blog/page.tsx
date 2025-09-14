import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { allPosts } from "content-collections";
import { Button } from "@/components/ui/button";

export default function AdminBlog() {
  const session = cookies().get("editor_token");
  if (session?.value !== "granted") {
    redirect("/admin/blog/new");
  }
  return (
    <div className="container mx-auto mt-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Blog Admin</h1>
        <Link href="/admin/blog/new">
          <Button variant="outline" size="sm">
            + New post
          </Button>
        </Link>
      </div>
      <ul className="space-y-2">
        {allPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/admin/blog/${post.slug}`} className="underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
