import { ConfigurationError } from "../domain/configuration-diagnostic.ts";
import { parseDocument, isAlias, isNode, visit, LineCounter } from "yaml";
import { validateRecipe } from "../domain/recipe.ts";
import type { RecipeDocument } from "../domain/recipe.types.ts";
import { recipeLimits } from "../domain/recipe.constants.ts";

export function parseRecipeYaml(source: string) {
  if (Buffer.byteLength(source, "utf8") > recipeLimits.bytes)
    throw new Error("Recipe exceeds 1 MiB");
  const lineCounter = new LineCounter();
  const document = parseDocument(source, {
    version: "1.2",
    uniqueKeys: true,
    lineCounter,
  });
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
  return { document, lineCounter };
}

export function parseRecipe(source: string): RecipeDocument {
  const { document, lineCounter } = parseRecipeYaml(source);
  const parsed: unknown = document.toJS({ maxAliasCount: 0 });
  try {
    return validateRecipe(parsed);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const keys =
      error instanceof ConfigurationError ? [...error.diagnostic.path] : [];
    let node: unknown = document.getIn(keys, true);
    while (!isNode(node) && keys.length) {
      keys.pop();
      node = document.getIn(keys, true);
    }
    const { line, col } = lineCounter.linePos(
      isNode(node) ? (node.range?.[0] ?? 0) : 0,
    );
    const message = `${error.message} (line ${line}, column ${col})`;
    if (error instanceof ConfigurationError)
      throw new ConfigurationError(
        { ...error.diagnostic, message, line, column: col },
        { cause: error },
      );
    throw new Error(message, { cause: error });
  }
}
