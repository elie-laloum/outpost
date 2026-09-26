---
title: "HarnessToolContext"
description: "HarnessToolContext — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. The contract may change before release.
:::

## Import

```ts
import type { HarnessToolContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                | Presence | Meaning                                                                                                                                      |
| --------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease`                      | Required | Borrowed sandbox for commands and transfers. Operations follow the call deadline and turn cancellation; the tool cannot release the sandbox. |
| `signal`  | `AbortSignal`                       | Required | Aborted when the call deadline expires or the turn is cancelled. JavaScript that ignores it keeps running detached.                          |
| `callId`  | `string`                            | Required | Identifier of the model tool call being executed.                                                                                            |
| `model`   | `AgentModel`                        | Required | Normalized model of the agent running the tool.                                                                                              |
| `observe` | `(event: HarnessToolEvent) => void` | Required | Report text, warning or raw events to dispatch observers; other kinds are rejected.                                                          |

## Signature

```ts
export interface HarnessToolContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly callId: string;
  readonly model: AgentModel;
  observe(event: HarnessToolEvent): void;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [HarnessToolEvent](../harnesstoolevent/)
- [SandboxLease](../sandboxlease/)
