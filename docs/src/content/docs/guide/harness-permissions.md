---
title: "Permissions and hooks"
description: "Allow or deny the built-in harness’s tool calls with ordered rules, and run your own code at each step of its loop."
---

Permissions are declarative rules on tool calls. Hooks are functions that run at fixed points of the [built-in harness](../harness/) loop. Both are `createHarness()` options; to run commands while the sandbox is prepared, see [Prepare the environment](../environment-setup/).

## Allow only what the task needs

```ts
import {
  createAnthropicModelProvider,
  createHarness,
  createHarnessEditTools,
  createHarnessFileTools,
  createHarnessShellTools,
  defineHarnessPermissions,
} from "@elie-laloum/outpost";

const harness = createHarness({
  modelProvider: createAnthropicModelProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  }),
  tools: [
    createHarnessFileTools(),
    createHarnessEditTools(),
    createHarnessShellTools(),
  ],
  permissions: defineHarnessPermissions({
    default: "deny",
    rules: [
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
    ],
  }),
});
```

The model can read any file except `.env` files, edit under `src/` and `test/`, and run `npm test`. Any other call returns `Denied: <reason>` to the model as a failed tool result, and the loop continues. Pass `harness` to `createAgent({ harness, model })`.

## Write rules

Each rule has an `effect` (`"allow"` or `"deny"`) and one or more conditions. A rule matches when all its conditions match.

| Field      | Matches                               | Patterns                                                                |
| ---------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `tools`    | The tool name                         | `*` matches any text: `read_*`, `mcp__github__*`.                       |
| `paths`    | Repository-relative paths of the call | `*` stays within a segment, `**/` spans directories, `?` one character. |
| `commands` | The command line of the call          | `*` matches any text, spaces included.                                  |
| `reason`   | —                                     | The text the model receives when this rule denies.                      |

The first matching rule decides. Without a match, `default` applies; it is `"allow"` when omitted. An allow rule with `paths` needs every path of the call to match; a deny rule needs only one.

`paths` and `commands` match only tools that declare them. The built-in file, edit and search tools declare their paths; `shell` and `git` declare their command. For your own tools, declare `resources(input)` (see [Tools](../harness-tools/)).

## Intercept calls with hooks

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";

const hooks = [
  defineHarnessHook({
    on: "session-start",
    run: () => ({ instructions: "Run npm test before you answer." }),
  }),
  defineHarnessHook({
    on: "before-tool",
    run({ call, step }) {
      if (call.name === "write_file" && step > 20)
        return { deny: "Stop editing and summarize your changes." };
    },
  }),
  defineHarnessHook({
    on: "stop",
    run({ text }) {
      if (!text.includes("npm test"))
        return { continue: "Run npm test and report its result." };
    },
  }),
];
```

Pass the list to `createHarness({ hooks })`. A hook that returns nothing leaves the loop unchanged.

| Phase           | Receives                                   | Can return                                                          |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `session-start` | `prompt`                                   | `{ instructions }`, appended to the system instructions.            |
| `before-model`  | `messages` about to be sent                | Nothing: observe, or throw to stop the turn.                        |
| `after-model`   | The model `result`                         | Nothing: observe, or throw to stop the turn.                        |
| `before-tool`   | `call` (`name`, `input`)                   | `{ deny }` to refuse the call, or `{ input }` to replace its input. |
| `after-tool`    | `call` and `result` (`content`, `isError`) | `{ result }` to replace what the model receives.                    |
| `stop`          | The final `text`                           | `{ continue }` to send a new instruction instead of finishing.      |

Every phase also receives `sandbox`, `signal`, `model` and `step`.

## Know what runs first

<!-- flow -->

1. **Check**: Before the tool runs.
   - **Validate**: The input must match the tool’s schema.
   - **Evaluate permissions**: A denial ends the call; hooks do not run.
     - `permissions`
   - **Run before-tool hooks**: In declaration order. A `deny` ends the chain; an `input` goes to the next hook.
     - `before-tool`
   - **Re-check a rewrite**: Outpost validates the new input and evaluates permissions again.
     - `permissions`
2. **Run**: The tool executes against the sandbox.
3. **Return**: The model receives the result.
   - **Run after-tool hooks**: Also for denied and failed calls. Each can replace the result.
     - `after-tool`

Hooks of the same phase run in declaration order. For `stop`, the first hook that returns `{ continue }` wins, and the extra step still counts toward `limits.maxSteps`.

:::caution
A hook that throws, or returns a value its phase does not accept, fails the turn. [Progress observers](../progress/) cannot change the outcome; hooks can.
:::

## Apply rules to subagents

A [subagent](../subagents/) call runs only if the child’s permissions and those of every ancestor allow it, including after a hook rewrite. Hooks stay with the harness that declares them: parent hooks do not see the child’s calls.

## Limits

- Rules see only what a tool declares in `resources(input)`. A tool without it can be matched by name only.
- `commands: ["npm test*"]` also allows `npm test; rm -rf src`. List exact command lines.
- Absolute paths and paths leaving the repository match no `paths` pattern, so path deny rules do not catch them. The built-in tools refuse such paths; check them in your own tools.
- Rules and hooks control which calls start, not what an allowed tool does: `npm test` runs whatever the test script runs. Isolation comes from the [sandbox](../choose-a-sandbox/); see [Security](../security/).

API: [defineHarnessPermissions](../../reference/defineharnesspermissions/) · [HarnessPermissionRule](../../reference/harnesspermissionrule/) · [defineHarnessHook](../../reference/defineharnesshook/) · [HarnessHookPhase](../../reference/harnesshookphase/) · [createHarness](../../reference/createharness/).
