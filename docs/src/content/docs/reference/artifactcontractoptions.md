---
title: "ArtifactContractOptions"
description: "ArtifactContractOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ArtifactContractOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type     | Presence | Meaning                                                                                          |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------ |
| `name`    | `string` | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `version` | `string` | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |

## Signature

```ts
export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
