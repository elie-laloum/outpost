---
title: "Use native CLI hooks"
description: "Run your code when a CLI starts, calls a tool or finishes."
---

Attach a callback to your CLI's lifecycle to inspect or control its actions. Start with a [configured agent](../choose-an-agent/). The [Outpost loop](../harness-hooks/) has separate hooks.

## Refuse a tool call

This Claude hook refuses `Bash` calls and asks the agent to use file-reading tools. Pass `harness` to `createAgent({ harness })`, then [dispatch the agent](../first-request/).

```ts title="native-hooks.ts"
import { createClaudeHarness, defineClaudeHook } from "@elie-laloum/outpost";

export const harness = createClaudeHarness({
  authentication: "account",
  hooks: [
    defineClaudeHook({
      on: "PreToolUse",
      matcher: "Bash",
      run() {
        return {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "Use file-reading tools for this task.",
          },
        };
      },
    }),
  ],
});
```

The callback runs on the host. It receives the native `event`, a borrowed `sandbox` and an abort `signal`. Returning nothing leaves the action unchanged; returning a decision applies that CLI's rules.

## Native event inventory

Each CLI has its own factory, event names and decisions. The API lists all 85 exposed events and links to their native documentation.

| CLI         | Declare a hook                                                  | Available events                                              |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Claude Code | [defineClaudeHook](../../reference/defineclaudehook/)           | [ClaudeHookPhase](../../reference/claudehookphase/)           |
| Codex       | [defineCodexHook](../../reference/definecodexhook/)             | [CodexHookPhase](../../reference/codexhookphase/)             |
| Copilot CLI | [defineCopilotHook](../../reference/definecopilothook/)         | [CopilotHookPhase](../../reference/copilothookphase/)         |
| Kimi Code   | [defineKimiHook](../../reference/definekimihook/)               | [KimiHookPhase](../../reference/kimihookphase/)               |
| Antigravity | [defineAntigravityHook](../../reference/defineantigravityhook/) | [AntigravityHookPhase](../../reference/antigravityhookphase/) |

## Execution and configuration

- Callbacks need Node.js and a sandbox with `liveInput`. An invalid decision or callback error fails the turn. Honor `signal` for host work.
- Use `command: { executable: "node", arguments: ["scripts/check-hook.mjs"] }` instead of `run` for an existing script. It receives native JSON on stdin and follows the CLI's stdout and exit-code rules.
- Outpost installs and removes its hook declarations around each CLI process. Ordering and matching remain native; existing hooks are preserved.

:::note
Available from Outpost 11.2.0. Native event firing depends on CLI version and still needs live validation across all five CLIs and remote providers. Hooks do not replace [tool permissions](../agent-profiles/) or sandbox isolation.
:::

To share these hooks, declare them in [`defineAgentProfile({ hooks })`](../agent-profiles/#share-hooks). The harness selects its profile section before appending local hooks.

## Run the example

After building the package, run `node examples/74-lifecycle-hooks/index.ts claude` from the repository. The [complete example](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/74-lifecycle-hooks) supports all five CLIs and explains the required account login and Docker image.
