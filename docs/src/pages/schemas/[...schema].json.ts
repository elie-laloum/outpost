import type { APIRoute, GetStaticPaths } from "astro";
import { recipeSchemaAssets } from "../../../scripts/recipe-schema-assets.mjs";

export const prerender = true;

export const getStaticPaths = (async () =>
  (await recipeSchemaAssets()).map(({ path, body }) => ({
    params: { schema: path.replace(/\.json$/, "") },
    props: { body },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.body, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
