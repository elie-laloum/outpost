---
title: "SecretSource"
description: "SecretSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SecretSource } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                                                                                   | Presence | Meaning                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                                                               | Required | Stable name identifying the secret-manager implementation; must be nonempty when passed to fromSecrets.                                                                                                                                                                                                              |
| `resolve` | `(names: readonly string[], options?: SecretResolveOptions) => Promise<Readonly<Record<string, string \| undefined>>>` | Required | Read only requested names, optionally honoring the supplied signal, and return own data properties with string values or undefined for missing secrets. Do not write values to disk, mutate the host environment or enumerate undeclared secrets. Call through fromSecrets for bounded waiting and sanitized errors. |

## Signature

```ts
export interface SecretSource {
  readonly name: string;
  resolve(
    names: readonly string[],
    options?: SecretResolveOptions,
  ): Promise<Readonly<Record<string, string | undefined>>>;
}
```

## Related contracts

- [SecretResolveOptions](../secretresolveoptions/)
