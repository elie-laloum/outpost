---
title: "HarnessInstructionContext"
description: "HarnessInstructionContext — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessInstructionContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type           | Presence | Meaning                                                                                      |
| --------- | -------------- | -------- | -------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease` | Required | Borrowed sandbox of the turn, for example to read project guidance before the first request. |
| `signal`  | `AbortSignal`  | Required | Turn cancellation signal; honor it in asynchronous resolvers.                                |
| `model`   | `AgentModel`   | Required | Normalized model of the agent running the turn.                                              |

## Signature

```ts
export interface HarnessInstructionContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [SandboxLease](../sandboxlease/)
