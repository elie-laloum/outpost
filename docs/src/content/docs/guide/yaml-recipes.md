---
title: "Run YAML recipes"
description: "Run local command and agent steps from a YAML file."
---

## Declare the steps

Save this file as `recipe.yaml`. It asks the configured `coder` to fix the parser, then runs the check in the same sandbox. `after` refers to task keys; dependencies can appear later in the file.

```yaml title="recipe.yaml"
version: 1
name: parser-fix
tasks:
  - key: fix
    agent: coder
    brief: Fix the parser and commit the change.
    retry: { attempts: 2 }
  - key: verify
    after: [fix]
    command:
      executable: npm
      arguments: [test]
```

Each step selects a command or an agent with a literal brief. Commands use an executable and argument list; shell syntax requires an explicit shell executable. Steps may set `timeoutMs` and `retry` with `attempts` and `delayMs`. Commands support `executable`, `arguments`, `stdin`, `directory`, `variables` and `deadlineMs` from [Command](../../reference/command/). Resolve secrets in TypeScript, outside YAML.

Version 1 accepts one YAML 1.2 document, at most 1 MiB and 1,000 tasks. Unknown fields, duplicate keys, missing dependencies, cycles, custom tags and aliases fail before execution. Strings remain literal, including `${NAME}`. A curated recipe catalogue, remote discovery, includes and templates remain future work.

## Supply the sandbox and agents

Use the repository, provider and agent from [setup](../setup/). Save this module beside the recipe. Its default factory receives the cancellation signal and returns an open sandbox plus named agents. The CLI owns the returned sandbox; the factory must clean up if it fails before returning.

```ts title="outpost.recipe.ts"
import { createSandbox, type RecipeBindings } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export default async function bindings(
  signal: AbortSignal,
): Promise<RecipeBindings> {
  return {
    sandbox: await createSandbox({
      repository,
      sandboxProvider,
      signal,
      logging: false,
    }),
    agents: { coder },
  };
}
```

The module is trusted executable code. Configure authentication, variables and branch policy through the normal APIs. Command directories are interpreted by the sandbox. Keep the factory's stdout quiet when using JSON output.

## Run the recipe

From your workflow project, pass both paths relative to the current directory. Use a TypeScript or JavaScript configuration module on Node.js 24+.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.recipe.ts --json
```

The CLI validates YAML before loading the module, runs one step at a time, then closes the sandbox. A nonzero command exit fails its task and stops dependent work. Failure or cancellation preserves the workspace through `close({ preserve: true })`; successful cleanup follows the configured branch policy. SIGINT/SIGTERM cancel setup or the workflow and wait for cleanup. See [CLI commands](../cli/#outpost-recipe-run) for flags and reports.

## Use the engine in TypeScript

`defineRecipe()` returns a normal [Workflow](../../reference/type-workflow/) without executing it. Save this script as `run-recipe.ts`, then run `node run-recipe.ts`. Here you own the sandbox and `await using` closes it. Results and usage follow the existing workflow contracts.

```ts title="run-recipe.ts"
import { readFile } from "node:fs/promises";
import { createSandbox, defineRecipe } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const source = await readFile(
  new URL("./recipe.yaml", import.meta.url),
  "utf8",
);
const workflow = defineRecipe(source, { sandbox, agents: { coder } });
const result = await workflow.start();
result.unwrap();
```

Recipes require concurrency 1 because their tasks share a sandbox. Agent steps return dispatch results that cannot be persisted as lossless JSON checkpoints. Use [typed workflows](../typed-workflows/) for JSON projections, gates, dynamic requests and durable agent runs. The offline executable test is `examples/64-yaml-recipes/index.ts` in the repository: build Outpost, then run `node --test examples/64-yaml-recipes/index.ts`. It uses scripted agents, simulated commands and real Git commits; paid agent and cloud runs remain unvalidated.

API: [defineRecipe](../../reference/definerecipe/) · [RecipeBindings](../../reference/recipebindings/).
