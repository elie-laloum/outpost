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

| Name       | Type                 | Presence | Meaning                                                                                          |
| ---------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `name`     | `string`             | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `version`  | `string`             | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |
| `encoding` | `"json" \| "binary"` | Required | Payload representation required by the artifact contract: json or binary.                        |

## Signature

```ts
export interface ArtifactIdentity {
  readonly name: string;
  readonly version: string;
  readonly encoding: "json" | "binary";
}
```
