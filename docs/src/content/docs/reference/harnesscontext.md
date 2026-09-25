---
title: "HarnessContext"
description: "HarnessContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                          | Presence | Meaning                                                                                                                                                                   |
| --------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`         | `string`                      | Required | Model name selected on the composed agent; requests inherit its reasoning and output limit unless they set their own.                                                     |
| `modelProvider` | `ModelProvider`               | Required | Request wrapper bound to this agent’s model and cancellation; reported usage is accumulated across calls.                                                                 |
| `sandbox`       | `SandboxLease`                | Required | Borrowed sandbox capabilities for commands and transfers. The harness cannot release the lease; operations inherit turn cancellation.                                     |
| `signal`        | `AbortSignal`                 | Required | Combined external cancellation and execution deadline; callbacks must cooperate with this signal.                                                                         |
| `observe`       | `(event: AgentEvent) => void` | Required | Emit an observation without allowing observer exceptions to alter execution. Result, usage and completion are managed by the runner; conversation events are unsupported. |

## Signature

```ts
export interface HarnessContext {
  readonly model: string;
  readonly modelProvider: ModelProvider;
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
  observe(event: AgentEvent): void;
}
```

## Related contracts

- [AgentEvent](../agentevent/)
- [ModelProvider](../modelprovider/)
- [SandboxLease](../sandboxlease/)
