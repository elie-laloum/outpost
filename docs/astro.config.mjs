import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import celestia from "starlight-theme-celestia";
import apiGroups from "./reference-content/navigation.json" with { type: "json" };
import { chapters } from "./scripts/navigation.mjs";

const base = process.env.DOCS_BASE ?? "/outpost";
export default defineConfig({
  site: "https://elie-laloum.github.io",
  base,
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Outpost",
      description: "Run an agent, own its environment, compose a workflow.",
      locales: {
        root: { label: "English", lang: "en" },
        fr: { label: "Français", lang: "fr" },
      },
      plugins: [
        celestia({
          stylingSystem: "css",
          multiSidebar: { switcherStyle: "horizontalList" },
        }),
      ],
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
      sidebar: [
        {
          label: "Guide",
          items: [
            ...chapters.map(([label, fr, items], index) => ({
              label,
              translations: { fr },
              collapsed: index !== 0,
              items,
            })),
            {
              label: "CLI and configuration",
              translations: { fr: "CLI et configuration" },
              items: [
                "guide/manual/cli",
                "guide/manual/cli-images",
                "guide/manual/configuration",
                "guide/manual/authentication",
                "guide/manual/compatibility",
              ],
            },
            {
              label: "Behavior in depth",
              translations: { fr: "Comportements détaillés" },
              collapsed: true,
              items: [{ autogenerate: { directory: "guide/behavior" } }],
            },
          ],
        },
        {
          label: "Reference",
          translations: { fr: "Référence" },
          items: [
            ...apiGroups.map((group) => ({
              label: group.title[0],
              translations: { fr: group.title[1] },
              collapsed: true,
              items: group.items,
            })),
          ],
        },
      ],
      components: { Head: "./src/components/Head.astro" },
      customCss: ["./src/styles/custom.css"],
      lastUpdated: false,
    }),
  ],
});
