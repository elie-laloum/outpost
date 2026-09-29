---
title: "defineJsonArtifact"
description: "defineJsonArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineJsonArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a named, versioned contract for a lossless JSON value; schema validates it on publish and again on read. Throws when name or version is empty or longer than 1024 characters.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name              | Type                                                            | Presence | Meaning                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonArtifactOptions<T>`                                        | Required | Contract name, version and the schema applied on publish and on read.                                                                                                                   |
| `options.name`    | `string`                                                        | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                                                                     |
| `options.version` | `string`                                                        | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes.                                              |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Standard Schema validator (Zod, Valibot…) or a function that returns the checked value or throws. Runs before encoding and after decoding; its output is the value stored and returned. |

## Returns

`ArtifactContract<T>`

## Signature

```ts
export declare function defineJsonArtifact<T>(
  options: JsonArtifactOptions<T>,
): ArtifactContract<T>;
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [JsonArtifactOptions](../jsonartifactoptions/)
