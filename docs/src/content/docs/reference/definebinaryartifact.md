---
title: "defineBinaryArtifact"
description: "defineBinaryArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineBinaryArtifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a named, versioned binary artifact contract that copies Uint8Array payloads on encoding and decoding. Declaring a contract does not publish an artifact.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name              | Type                      | Presence | Meaning                                                                                          |
| ----------------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `options`         | `ArtifactContractOptions` | Required | Contract name and version identifying the binary payload.                                        |
| `options.name`    | `string`                  | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `options.version` | `string`                  | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |

## Returns

`ArtifactContract<Uint8Array<ArrayBufferLike>>`

## Signature

```ts
export declare function defineBinaryArtifact(
  options: ArtifactContractOptions,
): ArtifactContract<Uint8Array>;
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
