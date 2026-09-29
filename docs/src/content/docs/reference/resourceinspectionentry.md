---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                  | Presence | Meaning                                                                                                                                            |
| ----------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`      | `string`                              | Required | Host path of the record's object file in local mode; its transport key, resources/&lt;id>.json, in transport mode.                                 |
| `record`    | `ResourceActivityRecord \| undefined` | Optional | Parsed record; absent when it was unreadable, invalid or changed during inspection.                                                                |
| `ownership` | `LockOwnership`                       | Required | Ownership verdict: status active, inactive or unknown, with a reason code such as LOCAL_IDENTITY_MATCH, PROCESS_EXITED or REMOTE_OWNER_UNVERIFIED. |

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Related contracts

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
