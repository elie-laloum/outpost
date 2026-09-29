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

Declare a named, versioned contract for Uint8Array payloads, copied on publish and on read. Throws when name or version is empty or longer than 1024 characters.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name              | Type                      | Presence | Meaning                                                                                                                                    |
| ----------------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`         | `ArtifactContractOptions` | Required | Contract name and version.                                                                                                                 |
| `options.name`    | `string`                  | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                        |
| `options.version` | `string`                  | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes. |

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
