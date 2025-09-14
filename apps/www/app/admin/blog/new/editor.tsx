"use client";

import { useState } from "react";

interface Initial {
  title?: string;
  slug?: string;
  description?: string;
  author?: string;
  body?: string;
}

interface Props {
  authors: string[];
  initial?: Initial;
}

export default function Editor({ authors, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [author, setAuthor] = useState(initial?.author ?? authors[0] ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [status, setStatus] = useState("");

  function toSlug(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function save() {
    const postSlug = slug || toSlug(title);
    const frontmatter = {
      title,
      description,
      author,
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      draft: true,
    };
    const res = await fetch("/api/admin/blog/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: postSlug, frontmatter, body }),
    });
    setStatus(res.ok ? "Saved" : "Error");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <label className="w-24">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-2 py-1 text-black rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-24">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={toSlug(title)}
          className="flex-1 px-2 py-1 text-black rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-24">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 px-2 py-1 text-black rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="w-24">Author</label>
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="px-2 py-1 text-black rounded"
        >
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={15}
          className="w-full px-2 py-1 text-black rounded"
        />
      </div>
      <button onClick={save} className="px-4 py-2 text-black bg-white rounded">
        Save Draft
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
