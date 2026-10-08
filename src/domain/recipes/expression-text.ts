import { recipeTemplatePattern } from "../recipe.constants.ts";
import type { RecipeTextReference } from "./expressions.types.ts";

export function recipeTextReferences(
  text: string,
  inputs: readonly string[],
  steps: readonly string[],
): readonly RecipeTextReference[] {
  if (text.replace(recipeTemplatePattern, "").includes("{{"))
    throw new Error("Unclosed recipe reference");
  return [...text.matchAll(recipeTemplatePattern)].map((match) => {
    const source = match[0],
      expression = match[1]!.trim();
    const kind = expression.startsWith("inputs.") ? "inputs" : "steps";
    if (!expression.startsWith(`${kind}.`))
      throw new Error(`Invalid recipe reference: ${source}`);
    const target = expression.slice(kind.length + 1);
    const key = [...(kind === "inputs" ? inputs : steps)]
      .sort((a, b) => b.length - a.length)
      .find((key) => target === key || target.startsWith(`${key}.`));
    if (!key) throw new Error(`Unknown recipe reference: ${source}`);
    const path = target === key ? [] : target.slice(key.length + 1).split(".");
    if (path.some((part) => !/^[A-Za-z0-9_-]+$/.test(part)))
      throw new Error(`Invalid recipe reference path: ${source}`);
    return { source, kind, key, path };
  });
}
