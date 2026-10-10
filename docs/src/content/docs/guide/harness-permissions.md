---
title: "Control tool permissions"
description: "Allow or deny tool calls and use hooks to inspect the built-in agent loop."
---

Apply permissions after choosing the [tools](../harness-tools/) the model can call. Test a permitted call and a denied call before relying on the rules. Tool declarations and hooks run on the host and must themselves be trusted.

Use permissions to decide which tool calls are allowed, and hooks to run your code at specific points in the [built-in loop](../harness/). Both are options of `createHarness()`. For commands that prepare a sandbox before a turn, use [environment hooks](../environment-setup/) instead.

## Allow only what the task needs

The model can read any file except `.env` files, edit under `src/` and `test/`, and run `npm test`. Any other call returns `Denied: <reason>` to the model as a failed tool result, and the loop continues. Pass `harness` to `createAgent({ harness, model })`.

<!-- tabs -->

```ts title="permission-rules.ts"
export const rules = [
  {
    effect: "deny",
    paths: ["**/.env*"],
    reason: "Environment files are private.",
  },
  { effect: "allow", tools: ["read_file", "list_files"] },
  {
    effect: "allow",
    tools: ["write_file", "edit_file"],
    paths: ["src/**", "test/**"],
  },
  { effect: "allow", tools: ["shell"], commands: ["npm test"] },
] as const;
```

```ts title="permissions.ts"
import { defineHarnessPermissions } from "@elie-laloum/outpost";
import { rules } from "./permission-rules.ts";

export const permissions = defineHarnessPermissions({ default: "deny", rules });
```

```ts title="permission-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="harness.ts"
import {
  createHarness,
  createHarnessFileTools,
  createHarnessEditTools,
  createHarnessShellTools,
} from "@elie-laloum/outpost";
import { modelProvider } from "./permission-model.ts";
import { permissions } from "./permissions.ts";

export const harness = createHarness({
  modelProvider,
  tools: [
    createHarnessFileTools(),
    createHarnessEditTools(),
    createHarnessShellTools(),
  ],
  permissions,
});
```

## Write rules

Each rule has an `effect` (`"allow"` or `"deny"`) and one or more conditions. A rule matches when all its conditions match.

API reference: [HarnessPermissionRule](../../reference/harnesspermissionrule/).

The first matching rule decides. Without a match, `default` applies; it is `"allow"` when omitted. An allow rule with `paths` needs every path of the call to match; a deny rule needs only one.

`paths` and `commands` match only tools that declare them. The built-in file, edit and search tools declare their paths; `shell` and `git` declare their command. For your own tools, declare `resources(input)` (see [Tools](../harness-tools/)).

<span id="intercept-calls-with-hooks"></span>
<span id="order-of-checks-and-hooks"></span>

For this step, follow [Intercept the agent loop](../harness-hooks/).

## Apply rules to subagents

A [subagent](../subagents/) call runs only if the child’s permissions and those of every ancestor allow it, including after a hook rewrite. Hooks stay with the harness that declares them: parent hooks do not see the child’s calls.

## Limits

- Rules see only what a tool declares in `resources(input)`. A tool without it can be matched by name only.
- `commands: ["npm test*"]` also allows `npm test; rm -rf src`. List exact command lines.
- Absolute paths and paths leaving the repository match no `paths` pattern, so path deny rules do not catch them. The built-in tools refuse such paths; check them in your own tools.
- Rules and hooks control which calls start, not what an allowed tool does: `npm test` runs whatever the test script runs. Isolation comes from the [sandbox](../choose-a-sandbox/); see [Security](../security/).

API: [defineHarnessPermissions](../../reference/defineharnesspermissions/) · [HarnessPermissionRule](../../reference/harnesspermissionrule/) · [defineHarnessHook](../../reference/defineharnesshook/) · [HarnessHookPhase](../../reference/harnesshookphase/) · [createHarness](../../reference/createharness/).
