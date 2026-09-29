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

Declare a named, versioned JSON artifact contract. The schema validates values during both encoding and decoding, and payloads must be lossless JSON. Declaring a contract does not publish an artifact.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name              | Type                                                            | Presence | Meaning                                                                                          |
| ----------------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `options`         | `JsonArtifactOptions<T>`                                        | Required | Contract name, version and the schema or parsing function applied when encoding and decoding.    |
| `options.name`    | `string`                                                        | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `options.version` | `string`                                                        | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Boundary validator that narrows unknown input.                                                   |

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
