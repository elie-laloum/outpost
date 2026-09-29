---
title: "Permissions and hooks"
description: "Allow, deny and intercept model-loop tool calls."
---

The built-in loop accepts `permissions` and `hooks` on `createHarness()`. Permissions provide ordered rules; hooks provide phase-specific behavior.

```ts
import {
  defineHarnessPermissions,
  defineHarnessHook,
} from "@elie-laloum/outpost";

const permissions = defineHarnessPermissions({
  default: "deny",
  rules: [{ effect: "allow", tools: ["git_status"] }],
});
const hook = defineHarnessHook({
  on: "before-tool",
  run({ call }) {
    if (call.name === "publish")
      return { deny: "Publishing needs an external approval." };
  },
});
```

## Rule ordering

The first matching rule decides. Rules can match tools, resource paths and command patterns. Set `default: "deny"` for an explicit allowlist. Permissions run before `before-tool` hooks and again after a hook rewrites input.

Permissions depend on each tool’s declared resources. They are not a substitute for sandbox isolation and cannot constrain arbitrary host code inside a tool.

## Hook phases

`session-start` can add instructions. `before-model` and `after-model` observe requests and responses. `before-tool` can deny or rewrite input; `after-tool` can replace the result. `stop` can ask the loop to continue with another instruction.

Hooks run in declaration order within a phase. Unlike progress observers, hook exceptions fail the turn. A hook preventing a stop still consumes loop limits; it does not make execution unbounded.

API: [defineHarnessPermissions](../../reference/defineharnesspermissions/) · [defineHarnessHook](../../reference/defineharnesshook/).
