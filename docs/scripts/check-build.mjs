import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const base = (process.env.DOCS_BASE ?? "/outpost").replace(/\/$/, "");
const origin = "https://elie-laloum.github.io";
const files = (await readdir(root, { recursive: true })).filter((file) =>
  file.endsWith(".html"),
);
const pages = new Map();
for (const file of files) {
  const route = file.replaceAll("\\", "/");
  const $ = load(await readFile(resolve(root, file), "utf8"));
  pages.set(route, $);
  if (route === "404.html") continue;
  assert.equal($("main").length, 1, `Missing main landmark: ${route}`);
  assert.equal($("h1").length, 1, `Expected one page title: ${route}`);
  assert.equal(
    $("html").attr("lang"),
    route.startsWith("fr/") ? "fr" : "en",
    `Incorrect language: ${route}`,
  );
  assert.ok(
    $("starlight-lang-select select option").length >= 2,
    `Missing language selector: ${route}`,
  );
}
const failures = [];
for (const [file, $] of pages) {
  const current = new URL(
    `${base}/${file.replace(/index\.html$/, "")}`,
    origin,
  );
  for (const node of $(
    "a[href], link[rel=stylesheet][href], script[src], img[src]",
  ).toArray()) {
    const href = $(node).attr("href") ?? $(node).attr("src");
    const url = new URL(href, current);
    if (url.origin !== origin || !url.pathname.startsWith(`${base}/`)) continue;
    const path = decodeURIComponent(url.pathname.slice(base.length + 1));
    const target = path.endsWith("/") ? `${path}index.html` : path;
    if (!(await stat(resolve(root, target)).catch(() => undefined))) {
      failures.push(`${file}: ${href}`);
      continue;
    }
    if (url.hash && pages.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (
        !pages
          .get(target)("[id]")
          .toArray()
          .some((element) => element.attribs.id === id)
      )
        failures.push(`${file}: missing anchor ${href}`);
    }
  }
}
assert.deepEqual(failures, [], "Broken local links or assets");
assert.ok(
  await stat(resolve(root, "pagefind/pagefind.js")),
  "Search index was not generated",
);
assert.ok(
  pages.has("index.html") && pages.has("fr/index.html"),
  "Both language homepages are required",
);
console.log(
  `${files.length} rendered pages: links, assets, anchors, languages and search verified.`,
);
