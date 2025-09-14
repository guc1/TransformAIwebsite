import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const COOKIE = "editor_code";
const BLOG_DIR = path.join(process.cwd(), "apps/www/content/blog");

export async function POST(req: NextRequest) {
  const hasSession = req.cookies.get(COOKIE)?.value === "true";
  if (!hasSession) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug, frontmatter, body } = await req.json();
  const file = matter.stringify(body ?? "", frontmatter);
  await fs.writeFile(path.join(BLOG_DIR, `${slug}.mdx`), file, "utf8");
  return NextResponse.json({ ok: true });
}
