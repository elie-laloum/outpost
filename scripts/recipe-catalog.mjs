import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parseRecipe } from "../src/infrastructure/recipe.ts";

const directory = new URL("../recipes/", import.meta.url);
const names = (await readdir(directory))
  .filter((name) => name.endsWith(".yaml"))
  .sort();
const recipes = [];
for (const file of names) {
  const bytes = await readFile(new URL(file, directory));
  const recipe = parseRecipe(bytes.toString("utf8"));
  if (
    recipe.name !== file.slice(0, -5) ||
    !recipe.description ||
    !recipe.recipeVersion
  )
    throw new Error(
      `${file} must declare its filename's name, description and recipeVersion`,
    );
  recipes.push({
    name: recipe.name,
    version: recipe.recipeVersion,
    description: recipe.description,
    source: `./${file}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}
const content = `${JSON.stringify({ version: 1, recipes }, null, 2)}\n`;
const file = new URL("catalog.json", directory);
if (process.argv.includes("--write")) await writeFile(file, content);
else if ((await readFile(file, "utf8")) !== content)
  throw new Error(
    "Recipe catalogue is stale; run node scripts/recipe-catalog.mjs --write",
  );
process.stdout.write(`${recipes.length} catalogue recipes validated.\n`);
