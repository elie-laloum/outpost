import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { groups as apiGroups } from "./scripts/api-groups.mjs";

const base = process.env.DOCS_BASE ?? "/outpost";
const groups = [
  ["Get started", "Bien démarrer", "start"],
  ["Sandboxes and Git", "Sandboxes et Git", "sandboxes"],
  ["Agents and prompts", "Agents et prompts", "agents"],
  ["Workflows", "Workflows", "workflows"],
  ["Cookbooks", "Cookbooks", "cookbooks"],
  ["Providers", "Providers", "providers"],
  ["Extend Outpost", "Étendre Outpost", "extend"],
  ["Operations", "Exploitation", "operations"],
  ["API reference", "Référence API", "reference"],
  ["Project", "Projet", "project"],
];

export default defineConfig({
  site: "https://elie-laloum.github.io",
  base,
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Outpost",
      description: "Sandboxes, coding agents and typed workflows.",
      locales: {
        root: { label: "English", lang: "en" },
        fr: { label: "Français", lang: "fr" },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/elie-laloum/outpost",
        },
      ],
      editLink: {
        baseUrl:
          "https://gitlab.elielaloum.com/elielaloum/outpost/-/edit/main/docs/",
      },
      sidebar: groups.map(([label, fr, directory]) =>
        directory === "reference"
          ? {
              label,
              translations: { fr },
              collapsed: true,
              items: [
                "reference",
                ...apiGroups.map((group) => ({
                  label: group.title[0],
                  translations: { fr: group.title[1] },
                  collapsed: true,
                  items: group.names
                    .split(" ")
                    .map((name) => `reference/${name.toLowerCase()}`),
                })),
              ],
            }
          : {
              label,
              translations: { fr },
              items: [{ autogenerate: { directory } }],
              collapsed: directory !== "start",
            },
      ),
      customCss: ["./src/styles/custom.css"],
      lastUpdated: false,
    }),
  ],
});
