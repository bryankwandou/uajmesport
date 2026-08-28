/* Keeps public/pdf.worker.min.mjs in step with the installed pdfjs-dist.
   The certificate converter loads the worker by URL rather than through the
   bundler, so the copy in public/ is the one that actually runs; refreshing it
   before every build means a dependency bump can never leave a stale worker
   behind. The file is committed as well, so `next start` works without a
   build step. */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = join(root, "public", "pdf.worker.min.mjs");

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log("pdf.worker.min.mjs refreshed from pdfjs-dist");
} else if (existsSync(dest)) {
  console.log("pdfjs-dist build not found; keeping the committed worker");
} else {
  console.error("pdf.worker.min.mjs is missing and pdfjs-dist is not installed");
  process.exit(1);
}
