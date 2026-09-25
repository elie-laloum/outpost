---
title: "FileArtifactStoreOptions"
description: "FileArtifactStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                     | Presence | Meaning                                                                                                           |
| ------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string \| undefined`    | Optional | Legacy filesystem store directory, mutually exclusive with transporter; existing blob layout is preserved.        |
| `transporter` | `Transport \| undefined` | Optional | Alternative to directory; delegates to artifactStore with the same size limit. Supply exactly one storage choice. |
| `maxBytes`    | `number \| undefined`    | Optional | Maximum bytes per stored artifact; defaults to 16 MiB.                                                            |

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory?: string;
  readonly transporter?: Transport;
  readonly maxBytes?: number;
}
```

## Related contracts

- [Transport](../transport/)
