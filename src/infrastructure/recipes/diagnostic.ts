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
      /\b(?:tasks|workflow|inputs|observation|observations|sinks|extensions|reports|agents|sandbox|workspace|repository|profiles|harnesses|models|tools|toolsets|permissions|hooks|skills|contexts|instructions|conversations|responses|decisions|questions|routings|subagents|transports|stores|secrets|variables|queues|verifiers|guards|artifacts|services|functions|steerings)(?:\.[\w-]+)*/.exec(
        message,
      );
    const keys = (match?.[0] ?? "")
      .split(".")
      .filter(Boolean)
      .map((key) => (/^\d+$/.test(key) ? Number(key) : key));
    if (keys[0] === "tasks" && typeof keys[1] === "string") {
      const taskNode = document.get("tasks");
      const entries: unknown = isNode(taskNode) ? taskNode.toJSON() : undefined;
      if (Array.isArray(entries)) {
        const index = entries.findIndex(
          (entry) =>
            typeof entry === "object" &&
            entry !== null &&
            "key" in entry &&
            entry.key === keys[1],
        );
        if (index >= 0) keys[1] = index;
      }
    }
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
