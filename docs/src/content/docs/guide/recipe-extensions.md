---
title: "Use local code in a recipe"
description: "Bind trusted local callbacks and reusable components to YAML tasks."
---

Use a local extension when YAML needs a transformation, hook or client supplied by your application. Extensions belong to the [execution configuration](../recipe-configuration/) and execute on the host with its permissions. Review that code before running the recipe.

For a first executable transformation with its module, follow [Call a local action](../recipe-callbacks/). This page then covers shared objects and their lifetimes.

## Reuse local observer objects

Declare extensions only in your local configuration. A module can export an already constructed object, borrowed for the invocation, or a factory with a static JSON Schema and an explicitly named disposer. Static validation checks these declarations without importing the module; runtime validation checks the actual export before sandbox allocation.

```yaml title="outpost.yaml — borrowed observer"
extensions:
  audit:
    module: ./audit.ts
    export: sink
    kind: sink
    version: "1"
observation:
  sinks:
    - $ref: extensions.audit
```

The exported `sink` implements `ObservationSink`. A borrowed object is never closed by the runtime. For a factory, add `factory: true`, `schema`, optional `options` and optional `dispose` naming another export. Factories receive their options and a context with cancellation, the configuration directory and named component resolution. Only local modules and already installed packages are accepted; a downloaded recipe cannot import extensions itself.

The `/recipes` package entry exposes `defineRecipeComponent`, `createRecipeRegistry`, `validateRecipeProject` and `createRecipeRuntime`. Runtime construction validates without allocating; `run()` allocates and cleans each invocation, and `close()` cancels an active invocation and prevents further runs. `examples/65-recipe-observation/` exercises declared observation and reporting without model calls.

Use [Available components](../yaml-components/) to find a declared component and its TypeScript contract.

## Bind typed callbacks locally

Callbacks stay in local modules and are selected through configuration. Their static `contract` names the component option they implement. The validator rejects a callback intended for another slot before loading its module; the runtime then checks that the export is callable before sandbox allocation. Callback return values remain subject to the native engine's validation.

```yaml title="outpost.yaml — a hook extension"
extensions:
  before:
    module: ./hooks.ts
    export: before
    kind: callback
    contract: hook.custom.run
    version: "1"
hooks:
  before:
    type: custom
    on: before-model
    run: { $ref: extensions.before }
```

Attach the hook through `hooks: [{ $ref: hooks.before }]` on a harness. Apply the same pattern to tool execution, custom context, instructions and routing state; errors identify the required contract. Factories can also receive typed component references through schema annotations. Owned components close in dependency order; observer cleanup errors appear in `observerErrors` without changing a successful task outcome.

Compose JSON values, conditions, loops, decisions and isolated tasks with [format-3 workflows](../recipe-workflows/). Data-only recipes allocate no sandbox.

## Use the engine in TypeScript

Use the `recipe.yaml` from [your first YAML recipe](../yaml-recipes/). `defineRecipe()` borrows the sandbox and returns a [Workflow](../../reference/type-workflow/). Here the caller owns integration, preservation and cleanup; the engine only executes tasks. Supply typed values through `inputs` and inspect results using the normal workflow API.

```ts title="run-recipe.ts"
import { readFile } from "node:fs/promises";
import { createSandbox, defineRecipe } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

const sandbox = await createSandbox({ repository, sandboxProvider });
try {
  const source = await readFile(
    new URL("./recipe.yaml", import.meta.url),
    "utf8",
  );
  const workflow = defineRecipe(source, {
    sandbox,
    agents: { coder },
    inputs: { focus: "installation instructions" },
  });
  (await workflow.start()).unwrap();
  await sandbox.workspace.integrate();
} finally {
  await sandbox.close({ preserve: true });
}
```

For the sequential recipes in this example, the shared sandbox requires concurrency 1. Use [durable YAML recipes](../recipe-durability/) for format-3 checkpoints and JSON result projections. The [recipe contract](../../reference/definerecipe/) describes validation limits.
