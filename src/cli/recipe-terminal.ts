import { isCancel, select, text } from "@clack/prompts";
import type { CliValues } from "./main.types.ts";
import type { RecipeInputPrompts } from "./recipe-dialogue.types.ts";

export function recipeInteractiveMode(
  values: CliValues,
  terminal = Boolean(process.stdin.isTTY && process.stderr.isTTY),
): boolean {
  if (values.interactive === false) return false;
  if (values.interactive === true && !terminal)
    throw new Error("--interactive requires a terminal on stdin and stderr");
  return values.interactive ?? (terminal && !values.json);
}

export function createRecipeInputPrompts(): RecipeInputPrompts {
  return {
    write(message) {
      process.stderr.write(message);
    },
    async text(message, signal) {
      const answer = await withRecipeInput(signal, (signal) =>
        text({
          message,
          input: process.stdin,
          output: process.stderr,
          signal,
          validate: (value) =>
            value?.trim() ? undefined : "Enter a non-empty answer",
        }),
      );
      return isCancel(answer) ? undefined : answer;
    },
    async select(message, choices, signal) {
      const answer = await withRecipeInput(signal, (signal) =>
        select({
          message,
          input: process.stdin,
          output: process.stderr,
          signal,
          options: choices.map((label, value) => ({ label, value })),
        }),
      );
      return isCancel(answer) ? undefined : answer;
    },
  };
}

async function withRecipeInput<T>(
  signal: AbortSignal,
  perform: (signal: AbortSignal) => Promise<T>,
): Promise<T | undefined> {
  if (process.stdin.readableEnded || process.stdin.destroyed) return undefined;
  const closed = new AbortController();
  const end = () => closed.abort();
  process.stdin.once("end", end);
  process.stdin.once("close", end);
  try {
    return await perform(AbortSignal.any([signal, closed.signal]));
  } finally {
    process.stdin.pause();
    process.stdin.off("end", end);
    process.stdin.off("close", end);
  }
}
