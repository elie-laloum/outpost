import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { validateRecipeCatalog } from "../domain/recipe-catalog.ts";
import { downloadRecipeResource } from "../infrastructure/recipe-download.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import type { CliInvocation } from "./main.types.ts";

export async function recipeCatalogCommand(
  { values, positionals }: CliInvocation,
  fetcher: typeof fetch = fetch,
  write: (text: string) => void = (text) => {
    process.stdout.write(text);
  },
): Promise<void> {
  const location = values.catalog
    ? !isAbsolute(values.catalog) && /^[a-z]+:/i.test(values.catalog)
      ? new URL(values.catalog)
      : pathToFileURL(resolve(values.catalog))
    : new URL("../../recipes/catalog.json", import.meta.url);
  const resource = await downloadRecipeResource(location, fetcher);
  const catalog = validateRecipeCatalog(
    JSON.parse(new TextDecoder().decode(resource.bytes)),
  );
  if (positionals[1] === "list") {
    write(
      values.json
        ? `${JSON.stringify(catalog)}\n`
        : catalog.recipes
            .map(
              (recipe) =>
                `${recipe.name}@${recipe.version} — ${recipe.description}\n`,
            )
            .join(""),
    );
    return;
  }
  if (!values.recipe || !values.file)
    throw new Error(
      "Recipe fetch requires --recipe <name> and --file <destination>",
    );
  const recipe = catalog.recipes.find((entry) => entry.name === values.recipe);
  if (!recipe) throw new Error(`Unknown catalogue recipe: ${values.recipe}`);
  const source = new URL(recipe.source, resource.location);
  if (resource.location.protocol !== "file:" && source.protocol !== "https:")
    throw new Error("Remote catalogues can only reference HTTPS recipes");
  const downloaded = await downloadRecipeResource(source, fetcher);
  const digest = createHash("sha256").update(downloaded.bytes).digest("hex");
  if (digest !== recipe.sha256)
    throw new Error(`Recipe digest mismatch: ${recipe.name}`);
  const document = parseRecipe(new TextDecoder().decode(downloaded.bytes));
  if (
    document.name !== recipe.name ||
    document.recipeVersion !== recipe.version
  )
    throw new Error("Recipe identity does not match its catalogue entry");
  const file = resolve(values.file);
  await writeFile(file, downloaded.bytes, { flag: "wx" });
  const report = {
    name: recipe.name,
    version: recipe.version,
    sha256: digest,
    file,
  };
  write(
    values.json
      ? `${JSON.stringify(report)}\n`
      : `Downloaded ${recipe.name}@${recipe.version} to ${file}\n`,
  );
}
