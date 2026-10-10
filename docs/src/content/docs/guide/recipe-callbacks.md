---
title: "Call local actions from YAML"
description: "Connect a YAML task to a declared local callback."
---

Start from [Compose YAML workflows](../recipe-workflows/) and its configuration. Connect a YAML task to a declared local callback.

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

Declare the module, export, version and callback contract in the local configuration. Alias the extension in `functions` to keep recipes independent of local module names. Validation resolves this metadata without importing the module; execution verifies its export before allocating resources.

```yaml title="outpost.yaml — callback binding"
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

Replace the previous recipe with this `recipe.yaml` and add `extensions` and `functions` to your version-2 `outpost.yaml`. Run `npx outpost recipe validate --file recipe.yaml --config outpost.yaml`, then the same command with `run --json`. The `summarize.value` output contains `count: 2` and both paths.

`loop` accepts `maxRounds`, `attempt` and `check`, through [defineLoopTask](../../reference/definelooptask/). Bind callbacks using `loop.options.attempt` and `loop.options.check`; attempt results become the step's JSON `value`, while the check receives the unwrapped result. Round history and usage are maintained by the existing scheduler. Loops do not accept ordinary retry, gate or interaction options.

`decision` accepts the provider, model, decision contract and truncation policy of [defineDecisionTask](../../reference/definedecisiontask/). A separate `state` expression supplies its structured context, and the result is available under `value`. No sandbox is allocated for a decision request.
