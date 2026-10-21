---
title: "AgentHookContext"
description: "AgentHookContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentHookContext } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name      | Type           | Presence | Meaning                                                                                               |
| --------- | -------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `sandbox` | `SandboxLease` | Required | Borrowed execution sandbox. Operations inherit the callback deadline; releasing the lease is refused. |
| `signal`  | `AbortSignal`  | Required | Cancellation signal for this callback, aborted when it finishes or its deadline expires.              |

## Signature

```ts
export interface AgentHookContext {
  readonly sandbox: SandboxLease;
  readonly signal: AbortSignal;
}
```

## Related contracts

- [SandboxLease](../sandboxlease/)
