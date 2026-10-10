import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { recipeSchemaAssets } from "./recipe-schema-assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const base = (process.env.DOCS_BASE ?? "/outpost").replace(/\/$/, "");
const origin = "https://elie-laloum.github.io";
const inventory = new Set(
  (await readdir(root, { recursive: true })).map((file) =>
    file.replaceAll("\\", "/"),
  ),
);
const files = [...inventory].filter((file) => file.endsWith(".html"));
for (const { path, body } of await recipeSchemaAssets())
  assert.equal(
    await readFile(resolve(root, "schemas", path), "utf8"),
    body,
    `Published schema differs from its source: ${path}`,
  );
for (const locale of ["", "fr/"])
  assert.ok(
    !inventory.has(`${locale}project/roadmap/index.html`),
    "Roadmap must remain in the repository only",
  );
const pages = new Map();
let guideCards = 0;
for (const file of files) {
  const $ = load(await readFile(resolve(root, file), "utf8"));
  const redirect = $("meta[http-equiv=refresh]").length > 0;
  if (/^(fr\/)?index\.html$/.test(file)) {
    const locale = file.startsWith("fr/") ? "fr" : "en";
    const home = `${origin}${base}/${locale === "fr" ? "fr/" : ""}`;
    const description = $('meta[name="description"]').attr("content");
    assert.equal($("h1").length, 1, `Home needs one H1: ${file}`);
    assert.match($("title").text(), /Outpost.*TypeScript/);
    assert.equal($('link[rel="canonical"]').attr("href"), home);
    assert.equal($('meta[property="og:type"]').attr("content"), "website");
    assert.equal($('meta[property="og:url"]').attr("content"), home);
    assert.equal(
      $('meta[property="og:description"]').attr("content"),
      description,
    );
    assert.equal(
      $('meta[name="twitter:description"]').attr("content"),
      description,
    );
    for (const lang of ["en", "fr", "x-default"])
      assert.equal($(`link[rel="alternate"][hreflang="${lang}"]`).length, 1);
    const image = `${origin}${base}/social/home-${locale}.png`;
    assert.equal($('meta[property="og:image"]').attr("content"), image);
    assert.equal($('meta[name="twitter:image"]').attr("content"), image);
    const png = await readFile(resolve(root, `social/home-${locale}.png`));
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    assert.equal(
      $('link[rel="shortcut icon"]').attr("href"),
      `${base}/favicon.svg`,
    );
    const data = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(data["@context"], "https://schema.org");
    assert.deepEqual(
      data["@graph"].map((entry) => entry["@type"]),
      ["WebSite", "SoftwareSourceCode"],
    );
    assert.equal(data["@graph"][0].url, home);
    assert.equal(data["@graph"][0].inLanguage, locale);
    assert.equal(data["@graph"][1].programmingLanguage, "TypeScript");
  }
  if (/^(fr\/)?(?:guide\/|index\.html$)/.test(file) && !redirect) {
    assert.ok(
      $(".sl-markdown-content").text().trim().length > 100,
      `Guide content failed to render: ${file}`,
    );
    const source = await readFile(
      resolve(
        root,
        "../src/content/docs",
        file
          .replace(/^(fr\/)?index\.html$/, "$1index.md")
          .replace(/\/index\.html$/, ".md"),
      ),
      "utf8",
    );
    assert.equal(
      $(".sl-markdown-content pre").length,
      [...source.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)].length,
      `Guide code blocks were lost during rendering: ${file}`,
    );
    assert.equal($(".flow").length, 0, `Retired flow diagram: ${file}`);
    $(".sl-markdown-content .bay-row[data-bay=split]").each((_, row) => {
      if (!$(row).children(".bay-show").find("pre").length) return;
      const explanations = $(row)
        .children(".bay-say")
        .find("p, li")
        .toArray()
        .map((element) => $(element).text().trim())
        .filter(
          (text) =>
            text && !/^(?:API(?: reference)?|Référence API)\s*:/i.test(text),
        );
      assert.ok(
        explanations.length,
        `Guide snippets need an explanation beside them: ${file}: ${$(row).children(".bay-show").find("code").first().text().slice(0, 80)}`,
      );
    });
    const cards = $(
      ".feature-cell, .path-cell, .canvas-node-head, .canvas-branch, .compare-head, .card",
    );
    cards.each((_, card) => {
      const icons = $(card).children("span").find("svg.guide-icon");
      assert.equal(
        icons.length,
        1,
        `Expected one card icon: ${file}: ${$(card).text()}`,
      );
      assert.equal(
        icons.attr("aria-hidden"),
        "true",
        `Decorative icon must be hidden from assistive technology: ${file}`,
      );
      assert.equal(
        icons.attr("focusable"),
        "false",
        `Decorative icon must not receive focus: ${file}`,
      );
    });
    guideCards += cards.length;
  }
  if (file !== "404.html") {
    assert.equal($("main").length, 1, `Missing main landmark: ${file}`);
    assert.equal($("h1").length, 1, `Expected one title: ${file}`);
    assert.equal(
      $("html").attr("lang"),
      file.startsWith("fr/") ? "fr" : "en",
      `Incorrect language: ${file}`,
    );
    if (!redirect)
      assert.equal(
        $(".docs-header a.language").attr("hreflang"),
        file.startsWith("fr/") ? "en" : "fr",
        `Missing language switch: ${file}`,
      );
    if (!redirect) {
      assert.deepEqual(
        $(".docs-header .spaces a")
          .toArray()
          .map((link) => $(link).text().trim()),
        ["Guide", "API"],
        `Unexpected documentation space: ${file}`,
      );
      const changelogLinks = $("a[href]").filter(
        (_, link) =>
          /\/project\/changelog\/$/.test($(link).attr("href")) &&
          !$(link).hasClass("language"),
      );
      assert.equal(
        changelogLinks.length,
        1,
        `Changelog must have only its version entry point: ${file}`,
      );
      assert.ok(
        changelogLinks.first().is(".docs-header .version"),
        `Changelog link is outside the header version button: ${file}`,
      );
      if (/^(fr\/)?project\/changelog\/index\.html$/.test(file)) {
        assert.equal(
          $("[data-pagefind-body]").length,
          0,
          `Changelog must be excluded from search: ${file}`,
        );
        assert.equal(
          $(".docs-footer .pager").length,
          0,
          `Changelog must have no pagination: ${file}`,
        );
      }
    }
  }
  pages.set(file, {
    ids: new Set(
      $("[id]")
        .toArray()
        .map((element) => element.attribs.id),
    ),
    links: [
      ...new Set(
        $("a[href], link[rel=stylesheet][href], script[src], img[src]")
          .toArray()
          .map((element) => $(element).attr("href") ?? $(element).attr("src")),
      ),
    ],
  });
}
const failures = [];
for (const [file, { links }] of pages) {
  const current = new URL(
    `${base}/${file.replace(/index\.html$/, "")}`,
    origin,
  );
  for (const href of links) {
    const url = new URL(href, current);
    if (url.origin !== origin || !url.pathname.startsWith(`${base}/`)) continue;
    const path = decodeURIComponent(url.pathname.slice(base.length + 1));
    const target = !path || path.endsWith("/") ? `${path}index.html` : path;
    if (!inventory.has(target)) {
      failures.push(`${file}: ${href}`);
      continue;
    }
    if (
      url.hash &&
      pages.has(target) &&
      !pages.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))
    )
      failures.push(`${file}: missing anchor ${href}`);
  }
}
const movedAnchors = JSON.parse(
  await readFile(
    new URL("../audit/guide-anchor-moves.json", import.meta.url),
    "utf8",
  ),
);
for (const { source, retained, destination } of movedAnchors) {
  assert.ok(
    inventory.has(`${source.split("#")[0]}index.html`),
    `Missing old route: ${source}`,
  );
  for (const link of [retained, destination]) {
    const [route, id] = link.split("#");
    const page = pages.get(`${route}index.html`);
    assert.ok(
      page && (!id || page.ids.has(id)),
      `Lost historical section: ${link}`,
    );
  }
}
assert.deepEqual(failures, [], "Broken local links or assets");
assert.ok(
  inventory.has("pagefind/pagefind.js"),
  "Search index was not generated",
);
assert.ok(
  pages.has("index.html") && pages.has("fr/index.html"),
  "Both language homepages are required",
);
console.log(
  `${files.length} rendered pages: links, assets, anchors, languages, search and ${guideCards} guide card icons verified.`,
);
