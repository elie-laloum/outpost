---
title: "JsonArtifactOptions"
description: "JsonArtifactOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { JsonArtifactOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                        | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                                                                     |
| `version` | `string`                                                        | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes.                                              |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Standard Schema validator (Zod, Valibot…) or a function that returns the checked value or throws. Runs before encoding and after decoding; its output is the value stored and returned. |

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Related contracts

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
