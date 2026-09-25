---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxContext**. See the [providers guide](../../guide/environment/providers/overview/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate local containers, explicit host execution or remote sandboxes through dedicated package entry points.

Mounted and host providers default to current branches; remote providers default to integration and reject current. Optional SDKs remain optional. Local execution provides no isolation.

[Complete example and detailed rules](../../guide/environment/providers/overview/).

## Parameters and properties

| Name             | Type                               | Presence | Meaning                                                                 |
| ---------------- | ---------------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`     | `string`                           | Required | Target host Git checkout.                                               |
| `directory`      | `string`                           | Required | Filesystem directory used by the owning operation; see path rules.      |
| `gitDirectories` | `readonly string[]`                | Required | See the linked contract and this family's rules for its interpretation. |
| `variables`      | `Readonly<Record<string, string>>` | Required | Explicit environment declarations; values are strings.                  |
| `signal`         | `AbortSignal \| undefined`         | Optional | Cooperative cancellation for this operation.                            |

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
