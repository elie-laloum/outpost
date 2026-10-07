---
title: "FromSecretsOptions"
description: "FromSecretsOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FromSecretsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                       | Presence | Meaning                                                                                                                                                                                         |
| ----------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timeoutMs` | `number \| undefined`      | Optional | Positive safe integer deadline for the complete resolution, default 30000 ms; at most 2147483647. Expiry rejects with code timeout and signals the source.                                      |
| `signal`    | `AbortSignal \| undefined` | Optional | Signal supplied to the source for this resolution. HTTP Vault, AWS and Azure cancel requests; other built-in SDK adapters check it between reads while fromSecrets stops waiting independently. |

## Signature

```ts
export interface FromSecretsOptions extends SecretResolveOptions {
  readonly timeoutMs?: number;
}
```

## Related contracts

- [SecretResolveOptions](../secretresolveoptions/)
