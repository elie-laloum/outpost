---
title: "WorkspaceAllocationRecord"
description: "WorkspaceAllocationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceAllocationRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                                    | Presence | Meaning                                                                                                 |
| ------------ | ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `provider`   | `string`                                                | Required | Execution provider identity retained for recovery, without storing credentials.                         |
| `state`      | `"active" \| "released" \| "allocating" \| "uncertain"` | Required | Persisted lifecycle state; uncertain or recovery-required resources are never silently reconstructed.   |
| `resourceId` | `string \| undefined`                                   | Optional | Provider resource identifier registered before acquisition completes when supported.                    |
| `reference`  | `TransportReference`                                    | Required | Transport key and revision identifying the conserved object; conditional revisions fence stale writers. |

## Signature

```ts
export interface WorkspaceAllocationRecord {
  readonly provider: string;
  readonly state: "allocating" | "active" | "uncertain" | "released";
  readonly resourceId?: string;
  readonly reference: TransportReference;
}
```

## Related contracts

- [TransportReference](../transportreference/)
