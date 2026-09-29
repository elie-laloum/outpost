---
title: "LocalTransportOptions"
description: "LocalTransportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LocalTransportOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                                                                                                  |
| ----------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string` | Required | Root directory, resolved when the factory is called; objects go under objects/ and locks under .outpost/locks. A symlinked root rejects the first write. |

## Signature

```ts
export interface LocalTransportOptions {
  readonly directory: string;
}
```
