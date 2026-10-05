import type { StarlightRouteData } from "@astrojs/starlight/route-data";

export type DocsSpace = "landing" | "guide" | "reference" | "changelog";
export type DocsRoute = StarlightRouteData;
export type SidebarEntry = StarlightRouteData["sidebar"][number];
export type SidebarLink = Extract<SidebarEntry, { type: "link" }>;

export interface Crumb {
  label: string;
  href?: string;
}
