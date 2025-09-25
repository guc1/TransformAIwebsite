import { createBuilder } from "@content-collections/core";

async function main() {
  const builder = await createBuilder("content-collections.ts");
  await builder.build();
}

main().catch((error) => {
  console.error("Failed to build content collections:", error);
  process.exit(1);
});
