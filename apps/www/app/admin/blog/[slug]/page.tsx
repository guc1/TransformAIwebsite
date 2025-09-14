import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { authors } from "@/content/blog/authors";
import Editor from "../new/editor";

export default async function EditPost({
  params,
}: {
  params: { slug: string };
}) {
  const file = await fs.readFile(
    path.join(process.cwd(), "apps/www/content/blog", `${params.slug}.mdx`),
    "utf8",
  );
  const { data, content } = matter(file);
  return (
    <Editor
      authors={Object.keys(authors)}
      initial={{ ...(data as any), slug: params.slug, body: content }}
    />
  );
}
