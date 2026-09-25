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

| Name        | Type     | Presence | Meaning                                                                                                                                                           |
| ----------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string` | Required | Root of the objects and local mutation locks; resolved when the factory is called. Symlink directories are rejected. This layout differs from legacy file stores. |

## Signature

```ts
export interface LocalTransportOptions {
  readonly directory: string;
}
```
