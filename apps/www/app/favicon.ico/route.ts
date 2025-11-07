import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cachedFavicon: Buffer | undefined;

export async function GET() {
  if (!cachedFavicon) {
    cachedFavicon = await readFile(
      join(process.cwd(), "public/images/logos/transformai/purelogo.png"),
    );
  }

  return new Response(cachedFavicon, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
