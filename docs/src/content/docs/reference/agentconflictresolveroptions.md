---
title: "AgentConflictResolverOptions"
description: "AgentConflictResolverOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentConflictResolverOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                               | Presence | Meaning                                                                                                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sandboxProvider` | `SandboxProvider`                                  | Required | Explicit provider that allocates the resolution sandbox. It is independent of the agent and original task provider; there is no implicit host fallback.                                                                                                                                                                  |
| `verify`          | `Command`                                          | Required | Mandatory noninteractive command executed after the agent commits the combined resolution, in the resolution sandbox root. Rejects directory, terminal and live input overrides. A nonzero status fails with code process; default deadlineMs is 300000 and caller cancellation is combined with the integration signal. |
| `instructions`    | `string \| undefined`                              | Optional | Additional literal instructions appended to the built-in resolution brief. They guide the agent; verification, ancestry and diff guards are enforced independently.                                                                                                                                                      |
| `observe`         | `((event: AgentObservation) => void) \| undefined` | Optional | Historical agent observation callback for the resolution dispatch. Failures are isolated by the normal dispatch observation path.                                                                                                                                                                                        |
| `logging`         | `Logging \| undefined`                             | Optional | Journal configuration for the resolution sandbox dispatch; omitted uses the normal local journal, false disables it.                                                                                                                                                                                                     |

## Signature

```ts
export interface AgentConflictResolverOptions {
  readonly sandboxProvider: SandboxProvider;
  readonly verify: Command;
  readonly instructions?: string;
  readonly observe?: (event: AgentObservation) => void;
  readonly logging?: Logging;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
- [Command](../command/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
