---
title: "HarnessHookContext"
description: "HarnessHookContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHookContext } from "@elie-laloum/outpost/harness";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                    |
| -------------- | --------------------- | -------- | -------------------------------------------------------------------------- |
| `sandbox`      | `SandboxLease`        | Required | Borrowed sandbox of the turn; hooks may inspect the repository through it. |
| `signal`       | `AbortSignal`         | Required | Turn cancellation signal; asynchronous hooks should honor it.              |
| `model`        | `AgentModel`          | Required | Normalized model of the agent running the turn.                            |
| `step`         | `number`              | Required | Current step number; 0 during session-start.                               |
| `conversation` | `string \| undefined` | Optional | Current harness conversation identifier when captured.                     |
| `subagentId`   | `string \| undefined` | Optional | Current subagent run identifier, absent in the main loop.                  |
| `depth`        | `number \| undefined` | Optional | Delegation depth; zero for the main loop.                                  |

## Signature

```ts
export interface HarnessHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  readonly model: AgentModel;
  readonly step: number;
  readonly conversation?: string;
  readonly subagentId?: string;
  readonly depth?: number;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [SandboxLease](../sandboxlease/)
