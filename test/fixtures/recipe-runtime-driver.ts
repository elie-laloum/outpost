import { readFile } from "node:fs/promises";
import { createRecipeRuntime } from "../../src/recipes.ts";
import type {
  RecipeRunOptions,
  RecipeResumeOptions,
} from "../../src/recipes.ts";
import { createJsonDecoder } from "../../src/infrastructure/json-schema.ts";

const [operation, file, config, settingsFile] = process.argv.slice(2);
if (!file || !config || !settingsFile)
  throw new Error(
    "Driver requires an operation, recipe, configuration and settings",
  );
const settings = JSON.parse(await readFile(settingsFile, "utf8"));
await using runtime = await createRecipeRuntime({ file, config });
const handlers: Readonly<Record<string, () => Promise<unknown>>> = {
  run: () =>
    runtime.run(
      createJsonDecoder<RecipeRunOptions>({ type: "object" }, "settings").parse(
        settings,
      ),
    ),
  resume: () =>
    runtime.resume(
      createJsonDecoder<RecipeResumeOptions>(
        {
          type: "object",
          required: ["runId"],
          properties: { runId: { type: "string" } },
        },
        "settings",
      ).parse(settings),
    ),
  status: () => runtime.status(String(settings.runId)),
};
const execute = operation ? handlers[operation] : undefined;
if (!execute) throw new Error("Unknown driver operation");
process.stdout.write(`${JSON.stringify(await execute())}\n`);
