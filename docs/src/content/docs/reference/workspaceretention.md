---
title: "WorkspaceRetention"
description: "WorkspaceRetention — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceRetention } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                             | Presence          | Meaning                                                                                                                 |
| ------------- | -------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `policy`      | `"run" \| "local" \| "portable"` | Required          | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace. |
| `transporter` | `Transport`                      | Variant-dependent | Caller-owned Transport used for conservation; no implicit cloud SDK or credential loading.                              |

## Signature

```ts
export type WorkspaceRetention =
  | {
      readonly policy: "run" | "local";
    }
  | {
      readonly policy: "portable";
      readonly transporter: Transport;
    };
```

## Related contracts

- [Transport](../transport/)
