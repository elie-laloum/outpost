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

| Name        | Type                                  | Presence | Meaning                                                                   |
| ----------- | ------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `path`      | `string`                              | Required | Host path of the locally recorded sandbox activity file.                  |
| `record`    | `ResourceActivityRecord \| undefined` | Optional | Parsed local sandbox activity record, when readable and valid.            |
| `ownership` | `LockOwnership`                       | Required | Assessment of whether the recorded local process still owns the resource. |

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
