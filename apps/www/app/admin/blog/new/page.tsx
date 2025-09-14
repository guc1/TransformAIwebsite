import { cookies } from "next/headers";
import { LoginGate } from "./login-gate";

export default function NewPostPage() {
  const session = cookies().get("editor_token");
  if (session?.value === "granted") {
    return (
      <div className="container mx-auto mt-24 space-y-2">
        <h1 className="text-2xl font-bold">Blog editor</h1>
        <p className="text-muted-foreground">Editor interface coming soon.</p>
      </div>
    );
  }
  return <LoginGate />;
}
