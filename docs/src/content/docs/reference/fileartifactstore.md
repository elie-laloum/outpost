---
title: "fileArtifactStore"
description: "fileArtifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fileArtifactStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a filesystem store for immutable artifact bytes with atomic publication and bounded reads. maxBytes defaults to 16 MiB per payload. Existing IDs cannot be overwritten with different bytes; the caller manages retention.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name                | Type                       | Presence | Meaning                                                   |
| ------------------- | -------------------------- | -------- | --------------------------------------------------------- |
| `options`           | `FileArtifactStoreOptions` | Required | Artifact storage directory and maximum bytes per payload. |
| `options.directory` | `string`                   | Required | Host directory storing immutable artifact payloads by ID. |
| `options.maxBytes`  | `number \| undefined`      | Optional | Maximum bytes per stored artifact; defaults to 16 MiB.    |

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
