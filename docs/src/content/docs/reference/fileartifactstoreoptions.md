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

| Name        | Type                  | Presence | Meaning                                                   |
| ----------- | --------------------- | -------- | --------------------------------------------------------- |
| `directory` | `string`              | Required | Host directory storing immutable artifact payloads by ID. |
| `maxBytes`  | `number \| undefined` | Optional | Maximum bytes per stored artifact; defaults to 16 MiB.    |

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```
