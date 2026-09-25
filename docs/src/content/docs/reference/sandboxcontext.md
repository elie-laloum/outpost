---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                               | Presence | Meaning                                                                    |
| ---------------- | ---------------------------------- | -------- | -------------------------------------------------------------------------- |
| `repository`     | `string`                           | Required | Target host Git checkout.                                                  |
| `directory`      | `string`                           | Required | Host workspace directory used for this execution.                          |
| `gitDirectories` | `readonly string[]`                | Required | Host Git metadata directories required to access the workspace repository. |
| `variables`      | `Readonly<Record<string, string>>` | Required | Explicit environment declarations; values are strings.                     |
| `signal`         | `AbortSignal \| undefined`         | Optional | Cooperative cancellation for this operation.                               |

## Signature

```ts
export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [Variables](../variables/)
