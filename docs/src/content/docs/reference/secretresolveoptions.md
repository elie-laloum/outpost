---
title: "SecretResolveOptions"
description: "SecretResolveOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SecretResolveOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                       | Presence | Meaning                                                                                                                                                                                         |
| -------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signal` | `AbortSignal \| undefined` | Optional | Signal supplied to the source for this resolution. HTTP Vault, AWS and Azure cancel requests; other built-in SDK adapters check it between reads while fromSecrets stops waiting independently. |

## Signature

```ts
export interface SecretResolveOptions {
  readonly signal?: AbortSignal;
}
```
