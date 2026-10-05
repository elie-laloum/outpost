import migration from "../audit/migration.json" with { type: "json" };
import guide from "../audit/guide-redirects.json" with { type: "json" };
import { referenceRedirects } from "./reference-redirects.mjs";

const route = (name) =>
  `/${name.replace(/\.md$/, "").replace(/\/index$/, "")}/`;
const historical = Object.fromEntries(
  migration.pages
    .filter((page) => page.destination && page.source !== page.destination)
    .map((page) => [route(page.source), route(page.destination)]),
);
const redirects = { ...historical, ...referenceRedirects, ...guide };
export function resolveRoute(source) {
  const visited = new Set();
  let target = source;
  while (redirects[target]) {
    if (visited.has(target)) throw new Error(`Redirect cycle: ${source}`);
    visited.add(target);
    target = redirects[target];
  }
  return target;
}
export const routeRedirects = Object.fromEntries(
  Object.keys(redirects).map((source) => [source, resolveRoute(source)]),
);
