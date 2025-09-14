import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export default async function AdminBlog() {
  const dir = path.join(process.cwd(), "apps/www/content/blog");
  const files = await fs.readdir(dir);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const slug = f.replace(/\.mdx$/, "");
        const raw = await fs.readFile(path.join(dir, f), "utf8");
        const { data } = matter(raw);
        return { slug, ...(data as any) };
      }),
  );
  const drafts = posts.filter((p) => p.draft);
  const published = posts.filter((p) => !p.draft);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-end">
        <Link
          href="/admin/blog/new"
          className="px-3 py-1 text-black bg-white rounded"
        >
          + New post
        </Link>
      </div>
      <div>
        <h2 className="mb-2 text-xl">Unreleased (Drafts)</h2>
        <ul className="space-y-1">
          {drafts.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/blog/${p.slug}`}>{p.title ?? p.slug}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-2 text-xl">Published</h2>
        <ul className="space-y-1">
          {published.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/blog/${p.slug}`}>{p.title ?? p.slug}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
