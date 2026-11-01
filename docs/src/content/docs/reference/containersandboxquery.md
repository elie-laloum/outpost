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

| Name         | Type                               | Presence | Meaning                                                                                                                                                                                                                                              |
| ------------ | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels`     | `Readonly<Record<string, string>>` | Required | Labels every reported sandbox must carry, with the ContainerLabels rules; an invalid selector fails with a ConfigurationError before any engine command. At least one label is required, so a query cannot select every Outpost sandbox on the host. |
| `signal`     | `AbortSignal \| undefined`         | Optional | Cooperative cancellation of the whole listing; aborting stops the running engine command and rejects with the signal's reason.                                                                                                                       |
| `deadlineMs` | `number \| undefined`              | Optional | Maximum duration in milliseconds of the whole listing, retries included, default 10000; past it the listing rejects with code timeout.                                                                                                               |

## Signature

```ts
export interface ContainerSandboxQuery extends TransferOptions {
  readonly labels: ContainerLabels;
}
```

## Related contracts

- [ContainerLabels](../containerlabels/)
- [TransferOptions](../transferoptions/)
