import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/content/docs",
);
const files = (await readdir(root, { recursive: true })).filter((name) =>
  name.endsWith(".md"),
);
const english = files.filter(
  (name) => !name.replaceAll("\\", "/").startsWith("fr/"),
);
const french = files.filter((name) =>
  name.replaceAll("\\", "/").startsWith("fr/"),
);
assert.equal(
  english.length,
  french.length,
  "Every page needs an English/French counterpart",
);
for (const name of english)
  assert.ok(
    files.includes(`fr/${name}`) || files.includes(`fr\\${name}`),
    `Missing French page: ${name}`,
  );
for (const name of files) {
  const content = await readFile(resolve(root, name), "utf8");
  assert.match(content, /^---\r?\n[\s\S]*?title:/, `Missing title: ${name}`);
  assert.match(content, /description:/, `Missing description: ${name}`);
  assert.doesNotMatch(
    content,
    /\]\(guide:|TODO|TBD|migration-1\.1|README\.fr\.md/,
    `Unfinished or stale content: ${name}`,
  );
  assert.ok(content.length > 150, `Empty page: ${name}`);
  if (!name.includes("reference") && !name.endsWith("changelog.md"))
    assert.ok(
      content.split(/\r?\n/).length < 180,
      `Split this long guide: ${name}`,
    );
}
const other = (await readdir(root, { recursive: true })).filter((name) =>
  /\.(mdx|astro)$/.test(name),
);
assert.equal(other.length, 0, "Documentation pages must be Markdown");
console.log(
  `${english.length} pages per language checked in ${relative(process.cwd(), root)}.`,
);
