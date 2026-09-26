---
title: "HarnessHookInput"
description: "HarnessHookInput — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessHookInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type           | Presence | Meaning                                                                    |
| --------- | -------------- | -------- | -------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease` | Required | Borrowed sandbox of the turn; hooks may inspect the repository through it. |
| `signal`  | `AbortSignal`  | Required | Turn cancellation signal; asynchronous hooks should honor it.              |
| `model`   | `AgentModel`   | Required | Normalized model of the agent running the turn.                            |
| `step`    | `number`       | Required | Current step number; 0 during session-start.                               |

## Signature

```ts
export type HarnessHookInput<Phase extends HarnessHookPhase> =
  HarnessHookEvents[Phase] & HarnessHookContext;
```

## Related contracts

- [HarnessHookContext](../harnesshookcontext/)
- [HarnessHookEvents](../harnesshookevents/)
- [HarnessHookPhase](../harnesshookphase/)
