---
title: "MemorySandboxOptions"
description: "MemorySandboxOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MemorySandboxOptions } from "@elie-laloum/outpost/testing";
```

## Parameters and properties

| Name       | Type                                    | Presence | Meaning                                                                                                                                                                              |
| ---------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commands` | `readonly MemoryCommand[] \| undefined` | Optional | Ordered queue of exact executable/argument matches and their simulated results, shared across leases of this provider. Defaults to empty; scripted agent requests do not consume it. |

## Signature

```ts
export interface MemorySandboxOptions {
  readonly commands?: readonly MemoryCommand[];
}
```

## Related contracts

- [MemoryCommand](../memorycommand/)
