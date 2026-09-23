---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **ContainerOptions**. See the [providers guide](../../providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Signature

```ts
export interface ContainerOptions {
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Related contracts

- [Variables](../variables/)
- [Volume](../volume/)
