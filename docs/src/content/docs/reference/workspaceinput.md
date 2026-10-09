---
title: "WorkspaceInput"
description: "WorkspaceInput — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceInput } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                             | Presence          | Meaning                                                                                       |
| ------------- | -------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| `directory`   | `string`                         | Variant-dependent | Absolute local materialization or source directory; it is not a portable resource identity.   |
| `paths`       | `readonly string[] \| undefined` | Variant-dependent | Explicit relative path selection; copy selection does not implicitly apply .gitignore.        |
| `snapshot`    | `TransportReference`             | Variant-dependent | Transport reference to a verified file snapshot; restoration does not imply sandbox disposal. |
| `transporter` | `Transport`                      | Variant-dependent | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.    |

## Signature

```ts
export type WorkspaceInput =
  | {
      readonly directory: string;
      readonly paths?: readonly string[];
    }
  | {
      readonly snapshot: TransportReference;
      readonly transporter: Transport;
    };
```

## Related contracts

- [Transport](../transport/)
- [TransportReference](../transportreference/)
