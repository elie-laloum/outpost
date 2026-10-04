import type {
  Crumb,
  DocsRoute,
  DocsSpace,
  SidebarEntry,
  SidebarLink,
} from "./docs-route.types.ts";

const spaceLabels = {
  guide: ["Guide", "Guide"],
  reference: ["API", "API"],
  project: ["Project", "Projet"],
} as const;
const spaceHomes = {
  guide: "guide/introduction/",
  reference: "reference/",
  project: "project/changelog/",
} as const;

export function docsSpace(route: DocsRoute): DocsSpace {
  if (route.entry.data.landing) return "landing";
  const id = route.entry.id.replace(/^fr(\/|$)/, "");
  if (id.startsWith("guide/")) return "guide";
  if (id === "reference" || id.startsWith("reference/")) return "reference";
  return "project";
}

export function isFrench(route: DocsRoute): boolean {
  return route.locale === "fr";
}

export function docsHref(route: DocsRoute, path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${isFrench(route) ? "fr/" : ""}${path}`;
}

export function spaceLinks(route: DocsRoute) {
  const french = isFrench(route) ? 1 : 0;
  return (["guide", "reference", "project"] as const).map((space) => ({
    space,
    label: spaceLabels[space][french],
    href: docsHref(route, spaceHomes[space]),
  }));
}

// Groups from the sidebar root down to the group holding the current page.
export function currentTrail(entries: SidebarEntry[]): SidebarEntry[] {
  for (const entry of entries) {
    if (entry.type === "link") {
      if (entry.isCurrent) return [];
      continue;
    }
    const inner = currentTrail(entry.entries);
    if (inner.length || entry.entries.some(isCurrentLink))
      return [entry, ...inner];
  }
  return [];
}

export function currentLink(entries: SidebarEntry[]): SidebarLink | undefined {
  for (const entry of entries) {
    if (entry.type === "link" && entry.isCurrent) return entry;
    if (entry.type === "group") {
      const found = currentLink(entry.entries);
      if (found) return found;
    }
  }
  return undefined;
}

export function breadcrumbs(route: DocsRoute): Crumb[] {
  const space = docsSpace(route);
  if (space === "landing") return [];
  const home = spaceLinks(route).find((link) => link.space === space)!;
  const root = route.sidebar[0];
  if (space !== "guide" || !root || root.type !== "group")
    return [{ label: home.label, href: home.href }];
  const trail = currentTrail(root.entries).map((group) => ({
    label: group.label,
  }));
  return [{ label: home.label, href: home.href }, ...trail];
}

function isCurrentLink(entry: SidebarEntry): boolean {
  return entry.type === "link" && entry.isCurrent;
}

// Identifier words, so long API names wrap between words rather than mid-word.
export function identifierParts(label: string): string[] {
  return label.split(/(?<=[a-z0-9])(?=[A-Z])/);
}
