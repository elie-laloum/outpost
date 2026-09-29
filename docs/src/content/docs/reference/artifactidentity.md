---
title: "ArtifactIdentity"
description: "ArtifactIdentity — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactIdentity } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                 | Presence | Meaning                                                                                                                                    |
| ---------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`     | `string`             | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                        |
| `version`  | `string`             | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes. |
| `encoding` | `"json" \| "binary"` | Required | json for a defineJsonArtifact() contract, binary for a defineBinaryArtifact() contract. A read requires the same encoding.                 |

## Signature

```ts
export interface ArtifactIdentity {
  readonly name: string;
  readonly version: string;
  readonly encoding: "json" | "binary";
}
```
