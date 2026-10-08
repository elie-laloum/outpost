import { parseDocument, isAlias, visit } from "yaml";
import { validateRecipe } from "../domain/recipe.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import { recipeLimits } from "../domain/recipe.constants.ts";

export function parseRecipe(source: string): RecipeDocument {
  if (Buffer.byteLength(source, "utf8") > recipeLimits.bytes)
    throw new Error("Recipe exceeds 1 MiB");
  const document = parseDocument(source, { version: "1.2", uniqueKeys: true });
  if (document.errors.length || document.warnings.length)
    throw new Error(
      "Invalid recipe YAML: " +
        [...document.errors, ...document.warnings]
          .map((error) => error.message)
          .join("; "),
    );
  visit(document, (_, node) => {
    if (isAlias(node)) throw new Error("Recipe YAML aliases are unsupported");
  });
  const parsed: unknown = document.toJS({ maxAliasCount: 0 });
  return validateRecipe(parsed);
}
