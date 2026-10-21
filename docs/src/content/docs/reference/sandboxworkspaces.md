---
title: "SandboxWorkspaces"
description: "SandboxWorkspaces — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxWorkspaces } from "@elie-laloum/outpost/integrations";
```

## Parameters and properties

| Name       | Type                                                     | Presence | Meaning                                                                                                |
| ---------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `bindings` | `readonly FileWorkspaceBinding[]`                        | Required | Explicit supported copy, ephemeral, read-only mount and writable mount bindings.                       |
| `acquire`  | `(context: FileSandboxContext) => Promise<SandboxLease>` | Required | Acquire from a file context without repository discovery; unsupported bindings fail before allocation. |

## Signature

```ts
export interface SandboxWorkspaces {
  readonly bindings: readonly FileWorkspaceBinding[];
  acquire(context: FileSandboxContext): Promise<SandboxLease>;
}
```

## Related contracts

- [FileSandboxContext](../filesandboxcontext/)
- [FileWorkspaceBinding](../support-fileworkspacebinding/)
- [SandboxLease](../sandboxlease/)
