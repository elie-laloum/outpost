import type { APIRoute } from "astro";
import metadata from "../../../../package.json";
import {
  downloadableExamples,
  exampleProject,
  projectArchive,
} from "../../../scripts/example-projects.mjs";

const sources = import.meta.glob<string>(
  ["../../content/docs/guide/*.md", "../../content/docs/fr/guide/*.md"],
  { eager: true, query: "?raw", import: "default" },
);

export function getStaticPaths() {
  return ["", "fr/"].flatMap((locale) =>
    downloadableExamples.map((slug) => ({
      params: { example: `${locale}${slug}` },
      props: { locale, slug },
    })),
  );
}

export const GET: APIRoute = async ({ props }) => {
  const archive = projectArchive(
    await exampleProject(props.slug, props.locale, {
      version: metadata.version,
      read: (name: string) => {
        const source =
          sources[`../../content/docs/${props.locale}guide/${name}.md`];
        if (source === undefined)
          throw new Error(`Missing guide example: ${name}`);
        return source;
      },
    }),
  );
  return new Response(new Uint8Array(archive), {
    headers: { "Content-Type": "application/gzip" },
  });
};
