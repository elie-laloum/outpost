---
title: "ContainerInventoryOptions"
description: "ContainerInventoryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerInventoryOptions } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerInventoryOptions } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name         | Type                       | Presence | Meaning                                                                                        |
| ------------ | -------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `signal`     | `AbortSignal \| undefined` | Optional | Cooperative cancellation; aborting stops the running engine command and rejects the operation. |
| `deadlineMs` | `number \| undefined`      | Optional | Maximum duration in milliseconds of each engine command, default 10000.                        |

## Signature

```ts
export interface ContainerInventoryOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
