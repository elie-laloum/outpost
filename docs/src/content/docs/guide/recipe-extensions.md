---
title: "Use local code in a recipe"
description: "Bind trusted local callbacks and reusable components to YAML tasks."
---

Use a local extension when YAML needs a transformation, hook or client supplied by your application. Extensions belong to the [execution configuration](../recipe-configuration/) and execute on the host with its permissions. Review that code before running the recipe.

## Declare local actions

For a complex transformation, `call` selects an explicitly configured callback and `arguments` builds its JSON input. The callback receives that value and the native task context, including cancellation, usage reporting and the idempotency key. Its returned value must be lossless JSON. The shareable recipe selects a declared reference; it cannot add a module import.

```yaml title="recipe.yaml"
version: 3
name: summarize-files
tasks:
  - key: select
    value: [src/index.ts, src/parser.ts]
  - key: summarize
    after: [select]
    call: { $ref: functions.summary }
    arguments: { $step: select, path: [value] }
```

Save this complete local configuration. It needs no workspace or sandbox for these data tasks. Alias the extension in `functions` to keep recipes independent of local module names. Validation resolves this metadata without importing the module; execution verifies its export before allocating resources.

```yaml title="outpost.yaml"
version: 3
extensions:
  summary:
    module: ./steps.ts
    export: summary
    kind: callback
    contract: call.options.perform
    version: "1"
functions:
  summary: { $ref: extensions.summary }
```

Save this module beside the configuration. It validates its input before returning a JSON object.

```ts title="steps.ts"
export function summary(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string"))
    throw new Error("Expected file names");
  return { count: value.length, files: value };
}
```

Save both YAML files and `steps.ts` together. Run `npx outpost recipe validate --file recipe.yaml --config outpost.yaml`, then the same command with `run --json`. The `summarize.value` output contains `count: 2` and both paths.

`loop` accepts `maxRounds`, `attempt` and `check`, through [defineLoopTask](../../reference/definelooptask/). Bind callbacks using `loop.options.attempt` and `loop.options.check`; attempt results become the step's JSON `value`, while the check receives the unwrapped result. Round history and usage are maintained by the existing scheduler. Loops do not accept ordinary retry, gate or interaction options.

`decision` accepts the provider, model, decision contract and truncation policy of [defineDecisionTask](../../reference/definedecisiontask/). A separate `state` expression supplies its structured context, and the result is available under `value`. No sandbox is allocated for a decision request.

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

Save `run-recipe.ts` beside the two files from [your first YAML recipe](../yaml-recipes/). Run it with `node run-recipe.ts` in an ESM project. `createRecipeRuntime()` uses the same configuration as the CLI and owns its resources; `await using` closes it after execution.

```ts title="run-recipe.ts"
import { fileURLToPath } from "node:url";
import { createRecipeRuntime } from "@elie-laloum/outpost/recipes";

await using runtime = await createRecipeRuntime({
  file: fileURLToPath(new URL("./recipe.yaml", import.meta.url)),
  config: fileURLToPath(new URL("./outpost.yaml", import.meta.url)),
});
await runtime.run({ report: "json" });
```

For an already open sandbox, [defineRecipe](../../reference/definerecipe/) borrows it: the caller owns integration and cleanup. Workflow options, checkpoints and component references require the full runtime.
