// Post-build fix for static export. Next writes segment prefetch payloads as
//   out/news/__next.news/__PAGE__.txt
// but the client router requests them as
//   /news/__next.news.__PAGE__.txt
// Plain static hosts serve files as-is, so link prefetches 404. This writes a copy of
// each payload at the dotted path the router asks for.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let copied = 0;
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) {
      copied += await flatten(dir, full);
    } else if (e.name !== "_next") {
      copied += await walk(full);
    }
  }
  return copied;
}

async function flatten(routeDir, segDir) {
  let copied = 0;
  async function visit(dir) {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await visit(full);
      } else if (e.name.endsWith(".txt")) {
        const rel = path.relative(routeDir, full).split(path.sep).join(".");
        await fs.copyFile(full, path.join(routeDir, rel));
        copied++;
      }
    }
  }
  await visit(segDir);
  return copied;
}

const n = await walk(OUT);
console.log(`flatten-rsc: wrote ${n} prefetch payloads`);
