// Fails if any "/assets/..." path referenced in the source does not exist in public/.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const roots = ["app", "components", "lib"];
const exts = new Set([".ts", ".tsx", ".css", ".js", ".mjs"]);
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) files.push(p);
  }
};
roots.forEach(walk);

const missing = new Map();
const re = /["'`(](\/assets\/[A-Za-z0-9_\-./]+?\.(?:png|jpe?g|webp|svg|gif|mp4|webm|gltf|glb|fbx|bin|json))/g;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(re)) {
    const url = m[1];
    if (!existsSync(join("public", url))) missing.set(`${url}`, f);
  }
}

// every glTF must find its .bin and textures next to it
const models = "public/assets/models";
if (existsSync(models)) {
  for (const dir of readdirSync(models)) {
    const g = join(models, dir, `${dir}.gltf`);
    if (!existsSync(g)) continue;
    const j = JSON.parse(readFileSync(g, "utf8"));
    [...(j.buffers ?? []), ...(j.images ?? [])].forEach((x) => {
      if (x.uri && !x.uri.startsWith("data:") && !existsSync(join(models, dir, x.uri))) missing.set(`${dir}/${x.uri}`, g);
    });
  }
}

if (missing.size) {
  console.error("Missing assets:");
  missing.forEach((from, url) => console.error(`  ${url}  (referenced in ${from})`));
  process.exit(1);
}
console.log(`assets ok (${files.length} files scanned)`);
