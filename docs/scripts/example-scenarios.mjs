import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const contentRoot = resolve(root, "docs/src/content/docs");
export async function scenarios() {
  const results = [];
  for (const name of await readdir(contentRoot, { recursive: true })) {
    if (!name.endsWith(".md")) continue;
    const text = await readFile(resolve(contentRoot, name), "utf8");
    const mode = text.match(
      /<!-- scenario:(offline|sandbox|agent|local) -->/,
    )?.[1];
    if (!mode) continue;
    const files = new Map();
    for (const match of text.matchAll(
      /^```(?:ts|js)\s+file=([\w.-]+)\s*\n([\s\S]*?)^```/gm,
    )) {
      if (files.has(match[1]))
        throw new Error(`Duplicate example file: ${name}: ${match[1]}`);
      files.set(match[1], match[2]);
    }
    if (!files.has("example.mts"))
      throw new Error(`Missing entry point: ${name}`);
    results.push({ name: name.replaceAll("\\", "/"), mode, files });
  }
  return results;
}
