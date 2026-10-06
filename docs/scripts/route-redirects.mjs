import migration from "../audit/migration.json" with { type: "json" };
import guide from "../audit/guide-redirects.json" with { type: "json" };
import { referenceRedirects } from "./reference-redirects.mjs";
import { groups } from "./api-groups.mjs";
import { referenceSidebar } from "./reference-navigation.mjs";

const route = (name) =>
  `/${name.replace(/\.md$/, "").replace(/\/index$/, "")}/`;
const historical = Object.fromEntries(
  migration.pages
    .filter((page) => page.destination && page.source !== page.destination)
    .map((page) => [route(page.source), route(page.destination)]),
);
const retiredReference = Object.fromEntries(
  ["", "fr/"].flatMap((locale) => [
    [`/${locale}reference/`, `/${locale}${referenceSidebar[0].slug}/`],
    ...groups.map((group) => [
      `/${locale}reference/overview/${group.id}/`,
      `/${locale}${group.guide}/`,
    ]),
  ]),
);
const redirects = {
  ...historical,
  ...referenceRedirects,
  ...guide,
  ...retiredReference,
};
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
