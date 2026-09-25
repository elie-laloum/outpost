---
title: "fileArtifactStore"
description: "fileArtifactStore — Outpost API"
sidebar:
  order: 10
---

Public contract for **fileArtifactStore**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import { fileArtifactStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name                | Type                       | Presence | Meaning                                                                                  |
| ------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `FileArtifactStoreOptions` | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.directory` | `string`                   | Required | Filesystem directory used by the owning operation; see path rules.                       |
| `options.maxBytes`  | `number \| undefined`      | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`ArtifactStore`

## Signature

```ts
export declare function fileArtifactStore(
  options: FileArtifactStoreOptions,
): ArtifactStore;
```

## Related contracts

- [ArtifactStore](../artifactstore/)
- [FileArtifactStoreOptions](../fileartifactstoreoptions/)
