import { isNode } from "yaml";
import { parseRecipeYaml } from "../recipe.ts";

export function recipeFileError(
  file: string,
  source: string,
  cause: unknown,
): Error {
  const message = cause instanceof Error ? cause.message : String(cause);
  try {
    const { document, lineCounter } = parseRecipeYaml(source);
    const match =
      /\b(?:observation|observations|sinks|extensions|reports|agents|sandbox|repository)(?:\.[\w-]+)*/.exec(
        message,
      );
    const keys = (match?.[0] ?? "")
      .split(".")
      .filter(Boolean)
      .map((key) => (/^\d+$/.test(key) ? Number(key) : key));
    let node: unknown = document.getIn(keys, true);
    while (!isNode(node) && keys.length) {
      keys.pop();
      node = document.getIn(keys, true);
    }
    const position = lineCounter.linePos(
      isNode(node) ? (node.range?.[0] ?? 0) : 0,
    );
    return new Error(`${file}:${position.line}:${position.col}: ${message}`, {
      cause,
    });
  } catch {
    return new Error(`${file}: ${message}`, { cause });
  }
}
