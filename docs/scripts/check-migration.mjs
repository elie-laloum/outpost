import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { chapters } from "./navigation.mjs";
import { routeRedirects, resolveRoute } from "./route-redirects.mjs";

const root = new URL("../src/content/docs/", import.meta.url);
const files = (await readdir(root, { recursive: true }))
  .map((name) => name.replaceAll("\\", "/"))
  .filter((name) => name.endsWith(".md"));
const route = (name) =>
  `/${name
    .replaceAll("\\", "/")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "")}/`;
const routes = new Set(files.map(route));
for (const [source, target] of Object.entries(routeRedirects)) {
  assert.ok(!routes.has(source), `Redirect shadows content: ${source}`);
  assert.ok(
    routes.has(target),
    `Missing redirect destination: ${source} -> ${target}`,
  );
  assert.equal(
    source.startsWith("/fr/"),
    target.startsWith("/fr/"),
    `Redirect changes language: ${source}`,
  );
}
const migration = JSON.parse(
  await readFile(new URL("../audit/migration.json", import.meta.url), "utf8"),
);
for (const page of migration.pages) {
  for (const name of [page.source, page.destination, page.details].filter(
    Boolean,
  )) {
    assert.ok(
      routes.has(resolveRoute(route(name))),
      `Lost historical route: ${name}`,
    );
  }
}
for (const name of migration.publicRoutes) {
  for (const locale of ["", "fr/"])
    assert.ok(
      routes.has(resolveRoute(route(locale + name))),
      `Lost public route: ${locale}${name}`,
    );
}
for (const example of migration.examples) {
  for (const locale of ["", "fr/"])
    assert.ok(
      routes.has(resolveRoute(route(`${locale}${example.destination}.md`))),
      `Lost example destination: ${example.destination}`,
    );
}
const names = chapters.flatMap(([, , items]) => items);
assert.equal(new Set(names).size, names.length, "Duplicate guide navigation");
for (const name of names) {
  assert.ok(routes.has(`/${name}/`), `Missing guide page: ${name}`);
  assert.ok(
    routes.has(`/fr/${name}/`),
    `Missing translated guide page: ${name}`,
  );
}
const guidePages = files
  .filter((name) => name.startsWith("guide/"))
  .map((name) => name.replace(/\.md$/, ""));
assert.deepEqual(
  new Set(names),
  new Set(guidePages),
  "Every guide page must appear once in navigation",
);
console.log(
  `${guidePages.length} guide pages and ${Object.keys(routeRedirects).length} legacy routes verified.`,
);

const readme = await readFile(
  new URL("../../README.md", import.meta.url),
  "utf8",
);
for (const match of readme.matchAll(
  /https:\/\/elie-laloum\.github\.io\/outpost(\/[^)#\s"]*)/g,
)) {
  const path = match[1] === "/" ? "/index/" : match[1];
  assert.ok(
    routes.has(resolveRoute(path)),
    `Broken README documentation link: ${match[0]}`,
  );
}
