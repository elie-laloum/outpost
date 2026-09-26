import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import celestia from "starlight-theme-celestia";
import { referenceSidebar } from "./scripts/reference-navigation.mjs";
import { chapters } from "./scripts/navigation.mjs";

const base = process.env.DOCS_BASE ?? "/outpost";
export default defineConfig({
  site: "https://elie-laloum.github.io",
  base,
  trailingSlash: "always",
  markdown: { processor: unified() },
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
            ...chapters.map(([label, fr, items]) => ({
              label,
              translations: { fr },
              collapsed: false,
              items,
            })),
          ],
        },
        {
          label: "Reference",
          translations: { fr: "Référence" },
          items: referenceSidebar,
        },
      ],
      components: {
        PageFrame: "./src/components/GuideFrame.astro",
        Header: "./src/components/GuideHeader.astro",
        PageTitle: "./src/components/GuideTitle.astro",
        Head: "./src/components/Head.astro",
        Sidebar: "./src/components/Sidebar.astro",
      },
      customCss: ["./src/styles/custom.css"],
      lastUpdated: false,
    }),
  ],
});
