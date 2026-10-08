import { appendFile, readFile, writeFile } from "node:fs/promises";
import type { ModelProvider, TaskContext } from "../../src/index.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";

export const interview: ModelProvider = {
  name: "scripted-recipe-interview",
  async request(request) {
    const history = JSON.stringify(request.messages);
    const turn = history.includes("medium")
      ? { kind: "completed", output: { size: "medium" } }
      : { kind: "question", question: "Which size?" };
    const text = `<interaction>${JSON.stringify(turn)}</interaction>`;
    return {
      text,
      content: [{ type: "text", text }],
      stopReason: "end",
      usage: { input: 4, cached: 0, output: 2 },
    };
  },
};

export async function effect(input: unknown, context: TaskContext) {
  if (!recipeObject(input) || typeof input.file !== "string")
    throw new Error("Missing effect file");
  const previous = await readFile(input.file, "utf8").catch(() => "");
  await appendFile(input.file, `${context.idempotencyKey}\n`);
  context.reportUsage({ input: 3, cached: 1, output: 2 });
  if (!previous && input.fail) throw new Error("Interrupted effect");
  if (!previous && input.quota)
    throw new OutpostError("quota", "Usage limit reached");
  return { completed: true };
}

export const cacheKey = () => "stable-data-v1";

export async function crash(input: unknown, context: TaskContext) {
  if (!recipeObject(input) || typeof input.file !== "string")
    throw new Error("Missing crash marker");
  if (await readFile(input.file, "utf8").catch(() => "")) return "recovered";
  context.reportUsage({ input: 5, cached: 0, output: 1 });
  await context.checkpoint?.();
  await writeFile(input.file, "crashed");
  process.kill(process.pid, "SIGKILL");
  return "unreachable";
}

export function approvers(options: unknown) {
  if (!recipeObject(options) || typeof options.publicKey !== "string")
    throw new Error("Missing public key");
  const pem = options.publicKey;
  return async () => [
    {
      keyId: "maintainer",
      actor: "maintainer",
      publicKey: (await import("node:crypto")).createPublicKey(pem),
    },
  ];
}
