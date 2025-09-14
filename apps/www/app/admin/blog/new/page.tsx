import { cookies } from "next/headers";
import { authors } from "@/content/blog/authors";
import Gate from "./gate";
import Editor from "./editor";

export default function NewPostPage() {
  const hasSession = cookies().get("editor_code")?.value === "true";
  return hasSession ? <Editor authors={Object.keys(authors)} /> : <Gate />;
}
