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

Create an artifact store with exactly one directory or transporter. Directory mode preserves the existing immutable blob layout and private filesystem checks; transport mode delegates to artifactStore. Both enforce the configured payload bound and reject conflicting bytes for an existing ID.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name                  | Type                       | Presence | Meaning                                                                                                           |
| --------------------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `options`             | `FileArtifactStoreOptions` | Required | Exactly one legacy directory or object transporter, plus the per-artifact byte bound.                             |
| `options.directory`   | `string \| undefined`      | Optional | Legacy filesystem store directory, mutually exclusive with transporter; existing blob layout is preserved.        |
| `options.transporter` | `Transport \| undefined`   | Optional | Alternative to directory; delegates to artifactStore with the same size limit. Supply exactly one storage choice. |
| `options.maxBytes`    | `number \| undefined`      | Optional | Maximum bytes per stored artifact; defaults to 16 MiB.                                                            |

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
