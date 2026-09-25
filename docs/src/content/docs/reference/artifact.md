---
title: "artifact"
description: "artifact — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { artifact } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create named, versioned payload contracts with json or binary. JSON contracts validate both encoding and decoding and require lossless JSON; binary contracts copy Uint8Array bytes. Constructing a contract does not publish an artifact.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name     | Type                                                                 | Presence | Meaning                                                                                   |
| -------- | -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `json`   | `<T>(options: JsonArtifactOptions<T>) => ArtifactContract<T>`        | Required | Create a named JSON artifact contract that validates values during encoding and decoding. |
| `binary` | `(options: ArtifactContractOptions) => ArtifactContract<Uint8Array>` | Required | Create a named binary artifact contract that copies Uint8Array payloads.                  |

## Signature

```ts
export declare const artifact: {
  json<T>(options: JsonArtifactOptions<T>): ArtifactContract<T>;
  binary(options: ArtifactContractOptions): ArtifactContract<Uint8Array>;
};
```

## Related contracts

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
- [JsonArtifactOptions](../jsonartifactoptions/)
