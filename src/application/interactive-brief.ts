import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import type { Brief, PromptVariables } from "../domain/prompts.ts";
import { invariant } from "../domain/errors.ts";

export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;

export async function completeBrief(
  brief: Brief | undefined,
  signal?: AbortSignal,
  ask?: VariableQuestion,
): Promise<Brief | undefined> {
  signal?.throwIfAborted();
  if (!brief || brief.file === undefined) return brief;
  const source = await readFile(brief.file, "utf8");
  const supplied: Record<string, string | number | boolean> = {
    ...brief.values,
  };
  const missing = [
    ...new Set(
      [...source.matchAll(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g)].map(
        (match) => match[1]!,
      ),
    ),
  ].filter(
    (key) =>
      !["WORK_BRANCH", "BASE_BRANCH"].includes(key) && supplied[key] == null,
  );
  if (!missing.length) return brief;
  invariant(
    ask || process.stdin.isTTY,
    `Missing prompt variables: ${missing.join(", ")}. Provide brief.values or an ask callback outside an interactive terminal.`,
  );
  const terminal = ask
    ? undefined
    : createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const key of missing) {
      signal?.throwIfAborted();
      supplied[key] = ask
        ? await ask(key, signal)
        : await terminal!.question(`${key}: `, signal ? { signal } : {});
    }
    signal?.throwIfAborted();
    return { file: brief.file, values: supplied as PromptVariables };
  } finally {
    terminal?.close();
  }
}
