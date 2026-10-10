---
title: "Intercept the agent loop"
description: "Use hooks to reject a tool call or request another model step."
---

Start from [Control tool permissions](../harness-permissions/) and its configuration. Use hooks to reject a tool call or request another model step.

## Intercept calls with hooks

Use hooks to add instructions at the start, refuse `write_file` calls after step 20 and ask for a test report before the agent finishes. Pass the exported list to `createHarness({ hooks })`.

<!-- tabs -->

```ts title="editing-hooks.ts"
import { defineHarnessHook } from "@elie-laloum/outpost";

export const startHook = defineHarnessHook({
  on: "session-start",
  run: () => ({ instructions: "Run npm test before you answer." }),
});
export const editHook = defineHarnessHook({
  on: "before-tool",
  run({ call, step }) {
    if (call.name === "write_file" && step > 20)
      return { deny: "Stop editing and summarize your changes." };
  },
});
```

```ts title="completion-hook.ts"
import { defineHarnessHook } from "@elie-laloum/outpost";

export const completionHook = defineHarnessHook({
  on: "stop",
  run({ text }) {
    if (!text.includes("npm test"))
      return { continue: "Run npm test and report its result." };
  },
});
```

```ts title="hooks.ts"
import { startHook, editHook } from "./editing-hooks.ts";
import { completionHook } from "./completion-hook.ts";

export const hooks = [startHook, editHook, completionHook];
```

Pass the list to `createHarness({ hooks })`. A hook that returns nothing leaves the loop unchanged.

API reference: [HarnessHookPhase](../../reference/harnesshookphase/), [HarnessHookEvents](../../reference/harnesshookevents/), [HarnessHookDecisions](../../reference/harnesshookdecisions/) and [HarnessHookContext](../../reference/harnesshookcontext/).

## Order of checks and hooks

1. **Validate input and permissions.** A refusal skips the before-tool hooks.
2. **Run before-tool hooks in order.** A hook can refuse the call or rewrite its input. Outpost revalidates rewritten input and permissions.
3. **Execute the allowed tool in the sandbox.** Hooks cannot bypass permissions.
4. **Run after-tool hooks and answer the model.** These hooks also run for denied or failed calls and may replace the result.

Hooks of the same phase run in declaration order. For `stop`, the first hook that returns `{ continue }` wins, and the extra step still counts toward `limits.maxSteps`.

:::caution
A hook that throws, or returns a value its phase does not accept, fails the turn. [Progress observers](../progress/) cannot change the outcome; hooks can.
:::
