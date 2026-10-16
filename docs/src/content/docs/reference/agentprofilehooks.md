---
title: "AgentProfileHooks"
description: "AgentProfileHooks — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProfileHooks } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                        | Presence | Meaning                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claude`      | `readonly NativeHook<"claude", string>[] \| undefined`      | Optional | Claude hooks declared with defineClaudeHook. Only the matching CLI harness selects this frozen list; its adapter validates native event names when composing the harness.             |
| `codex`       | `readonly NativeHook<"codex", string>[] \| undefined`       | Optional | Codex hooks declared with defineCodexHook. Only the matching CLI harness selects this frozen list; its adapter validates native event names when composing the harness.               |
| `copilot`     | `readonly NativeHook<"copilot", string>[] \| undefined`     | Optional | Copilot hooks declared with defineCopilotHook. Only the matching CLI harness selects this frozen list; its adapter validates native event names when composing the harness.           |
| `kimi`        | `readonly NativeHook<"kimi", string>[] \| undefined`        | Optional | Kimi hooks declared with defineKimiHook. Only the matching CLI harness selects this frozen list; its adapter validates native event names when composing the harness.                 |
| `antigravity` | `readonly NativeHook<"antigravity", string>[] \| undefined` | Optional | Antigravity hooks declared with defineAntigravityHook. Only the matching CLI harness selects this frozen list; its adapter validates native event names when composing the harness.   |
| `outpost`     | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`     | Optional | Built-in loop hooks declared with defineHarnessHook; executed before local hooks of the same phase. They do not propagate to subagents unless the child explicitly uses this profile. |

## Signature

```ts
export interface AgentProfileHooks {
  readonly claude?: readonly NativeHook<"claude">[];
  readonly codex?: readonly NativeHook<"codex">[];
  readonly copilot?: readonly NativeHook<"copilot">[];
  readonly kimi?: readonly NativeHook<"kimi">[];
  readonly antigravity?: readonly NativeHook<"antigravity">[];
  readonly outpost?: readonly HarnessHook[];
}
```

## Related contracts

- [HarnessHook](../harnesshook/)
- [NativeHook](../support-nativehook/)
