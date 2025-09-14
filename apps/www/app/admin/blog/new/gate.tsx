"use client";

import { useState } from "react";

export default function Gate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/blog/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setError("Invalid code");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col max-w-sm gap-2 mx-auto mt-20"
    >
      <label className="text-sm">Enter editor code</label>
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="px-2 py-1 rounded text-black"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" className="px-3 py-1 text-black bg-white rounded">
        Enter
      </button>
    </form>
  );
}
