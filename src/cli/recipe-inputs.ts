import { recipeValue, resolveRecipeInputs } from "../domain/recipe-inputs.ts";
import type { RecipeDocument, RecipeValue } from "../domain/recipe.types.ts";

export function readRecipeInputs(
  document: RecipeDocument,
  arguments_: readonly string[] = [],
): Readonly<Record<string, RecipeValue>> {
  const values = new Map<string, RecipeValue>();
  for (const argument of arguments_) {
    const separator = argument.indexOf("=");
    if (separator < 1) throw new Error("Recipe --input expects name=value");
    const name = argument.slice(0, separator);
    if (!Object.hasOwn(document.inputs, name))
      throw new Error(`Unknown recipe input: ${name}`);
    if (values.has(name)) throw new Error(`Duplicate recipe input: ${name}`);
    const definition = document.inputs[name]!;
    const source = argument.slice(separator + 1);
    let value: unknown = source;
    if (definition.type !== "string") {
      try {
        value = JSON.parse(source);
      } catch {
        throw new Error(
          `Invalid recipe input ${name}: expected ${definition.type}`,
        );
      }
    }
    if (!recipeValue(value)) throw new Error(`Invalid recipe input: ${name}`);
    values.set(name, value);
  }
  return resolveRecipeInputs(document.inputs, Object.fromEntries(values));
}
