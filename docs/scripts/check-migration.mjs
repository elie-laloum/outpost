import { referenceRedirects } from "./reference-redirects.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chapters } from "./navigation.mjs";

const docs = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const content = resolve(docs, "src/content/docs");
const migration = JSON.parse(
  await readFile(resolve(docs, "audit/migration.json"), "utf8"),
);
const normalizedBody = (source) =>
  source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/(?<=\]\()[^)]+(?=\))/g, "URL")
    .replace(/\s+/g, "")
    .replace(/-{3,}/g, "---");
for (const page of migration.pages) {
  await access(resolve(content, page.destination));
  if (!page.details) continue;
  const preserved = await readFile(resolve(content, page.details), "utf8");
  const digest = createHash("sha256")
    .update(normalizedBody(preserved))
    .digest("hex");
  assert.equal(
    digest,
    page.preservedBodySha256,
    `Changed preserved contract: ${page.details}. Review the migration inventory before accepting information changes.`,
  );
  const headings = [...preserved.matchAll(/^#{1,6} (.+)$/gm)].map(
    (match) => match[1],
  );
  for (const section of page.sections)
    assert.ok(
      headings.includes(section),
      `Missing preserved section: ${page.source}: ${section}`,
    );
}
for (const route of migration.publicRoutes)
  for (const locale of ["", "fr/"])
    await access(resolve(content, locale + route)).catch(async () => {
      const target =
        referenceRedirects["/" + locale + route.replace(/\.md$/, "/")];
      assert.ok(
        target,
        `Missing preserved route or explicit redirect: ${locale}${route}`,
      );
      await access(resolve(content, target.slice(1).replace(/\/$/, ".md")));
    });
for (const example of migration.examples)
  for (const locale of ["", "fr/"])
    await access(resolve(content, `${locale}${example.destination}.md`));
const names = chapters.flatMap(([, , items]) => items);
assert.equal(
  new Set(names).size,
  names.length,
  "Guide navigation contains duplicate pages",
);
for (const name of names) {
  const alternatives = [`${name}.md`, `${name}/index.md`];
  assert.ok(
    (
      await Promise.all(
        alternatives.map((path) =>
          access(resolve(content, path)).then(
            () => true,
            () => false,
          ),
        ),
      )
    ).some(Boolean),
    `Unknown navigation entry: ${name}`,
  );
}
console.log(
  `${migration.pages.length} source pages and ${migration.examples.length} former examples have verified destinations.`,
);
