---
title: "ContainerSandboxQuery"
description: "ContainerSandboxQuery — Outpost API"
sidebar:
  order: 20
---

## Import

Choose one of these equivalent imports.

```ts
import type { ContainerSandboxQuery } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerSandboxQuery } from "@elie-laloum/outpost/providers/podman";
```

## Parameters and properties

| Name         | Type                               | Presence | Meaning                                                                                                                                                               |
| ------------ | ---------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels`     | `Readonly<Record<string, string>>` | Required | Labels every reported sandbox must carry, with the ContainerLabels rules. At least one label is required, so a query cannot select every Outpost sandbox on the host. |
| `signal`     | `AbortSignal \| undefined`         | Optional | Cooperative cancellation; aborting stops the running engine command and rejects the operation.                                                                        |
| `deadlineMs` | `number \| undefined`              | Optional | Maximum duration in milliseconds of each engine command, default 10000.                                                                                               |

## Signature

```ts
export interface ContainerSandboxQuery extends ContainerInventoryOptions {
  readonly labels: ContainerLabels;
}
```

## Related contracts

- [ContainerInventoryOptions](../containerinventoryoptions/)
- [ContainerLabels](../containerlabels/)
