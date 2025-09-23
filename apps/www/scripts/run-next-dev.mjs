#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");

const forwardedArgs = process.argv.slice(2);
const sanitizedArgs = forwardedArgs.filter(
  (arg, index) => !(index === 0 && arg === "--"),
);

process.argv = [process.argv[0], nextCli, "dev", ...sanitizedArgs];

await import(nextCli);
