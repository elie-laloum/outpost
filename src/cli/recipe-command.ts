import { open } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { bindRecipe } from "../application/recipe.ts";
import type { RecipeBindings } from "../application/recipe.types.ts";
import { parseRecipe } from "../infrastructure/recipe.ts";
import { recipeLimits } from "../domain/recipe.constants.ts";
import type { CliInvocation } from "./main.types.ts";

function assertBindings(value: unknown): asserts value is RecipeBindings {
  if (!value || typeof value !== "object" || !("sandbox" in value))
    throw new Error("Recipe configuration must return { sandbox, agents? }");
  const sandbox = value.sandbox;
  if (
    !sandbox ||
    typeof sandbox !== "object" ||
    !("command" in sandbox) ||
    typeof sandbox.command !== "function" ||
    !("dispatch" in sandbox) ||
    typeof sandbox.dispatch !== "function" ||
    !("close" in sandbox) ||
    typeof sandbox.close !== "function"
  )
    throw new Error("Recipe configuration must return an open Sandbox");
}

function validateAgents(agents: unknown): void {
  if (agents === undefined) return;
  if (!agents || typeof agents !== "object" || Array.isArray(agents))
    throw new Error("Recipe agents must be a mapping of composed agents");
  const registry: Record<string, unknown> = Object.fromEntries(
    Object.entries(agents),
  );
  for (const agent of Object.values(registry))
    if (
      !agent ||
      typeof agent !== "object" ||
      !("kind" in agent) ||
      typeof agent.kind !== "string" ||
      !["cli", "custom", "replay", "fallback"].includes(agent.kind)
    )
      throw new Error("Recipe agents must be composed Outpost agents");
}

async function readRecipe(file: string): Promise<string> {
  const handle = await open(file, "r");
  try {
    const buffer = Buffer.alloc(recipeLimits.bytes + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > recipeLimits.bytes) throw new Error("Recipe exceeds 1 MiB");
    return buffer.subarray(0, offset).toString("utf8");
  } finally {
    await handle.close();
  }
}

export async function recipeCommand({ values }: CliInvocation): Promise<void> {
  if (!values.file || !values.config)
    throw new Error(
      "Recipe run requires --file recipe.yaml and --config outpost.recipe.ts",
    );
  const document = parseRecipe(await readRecipe(resolve(values.file)));
  const configuration = resolve(values.config);
  if (![".ts", ".mts", ".js", ".mjs"].includes(extname(configuration)))
    throw new Error(
      "Recipe configuration must be a .ts, .mts, .js or .mjs module",
    );
  const module: unknown = await import(pathToFileURL(configuration).href);
  if (
    !module ||
    typeof module !== "object" ||
    !("default" in module) ||
    typeof module.default !== "function"
  )
    throw new Error(
      "Recipe configuration must export a default bindings factory",
    );
  const controller = new AbortController();
  const cancel = (code: number) => {
    process.exitCode = code;
    controller.abort();
  };
  const interrupt = () => cancel(130);
  const terminate = () => cancel(143);
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", terminate);
  try {
    const bindings: unknown = await module.default(controller.signal);
    assertBindings(bindings);
    let completed = false;
    try {
      validateAgents(bindings.agents);
      const workflow = bindRecipe(document, bindings);
      const result = await workflow.start({ signal: controller.signal });
      const report = {
        name: result.name,
        executionId: result.executionId,
        status: result.status,
        tasks: result.tasks,
        usage: result.usage,
      };
      process.stdout.write(
        values.json
          ? `${JSON.stringify(report)}\n`
          : `${result.name}: ${result.status}\n`,
      );
      result.unwrap();
      completed = true;
    } finally {
      await bindings.sandbox.close({ preserve: !completed });
    }
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", terminate);
  }
}
