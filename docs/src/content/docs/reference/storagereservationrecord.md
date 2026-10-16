---
title: "StorageReservationRecord"
description: "StorageReservationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StorageReservationRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                                                                                                                                                                    | Presence | Meaning                                                                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bytes` | `number`                                                                                                                                                                                | Required | Bytes still claimed by this reservation, including legacy entries.                                                                                                                                                     |
| `owner` | `{ readonly id: string; readonly host: string; readonly pid: number; readonly createdAt: string; readonly repository: string; readonly identity?: LocalProcessIdentity; } \| undefined` | Optional | Process instance ID, host name, PID, reservation creation time and repository, plus Linux process identity when available. Absent for legacy entries; these fields identify an owner but do not prove remote liveness. |

## Signature

```ts
export interface StorageReservationRecord {
  readonly bytes: number;
  readonly owner?: {
    readonly id: string;
    readonly host: string;
    readonly pid: number;
    readonly createdAt: string;
    readonly repository: string;
    readonly identity?: LocalProcessIdentity;
  };
}
```

## Related contracts

- [LocalProcessIdentity](../support-localprocessidentity/)
