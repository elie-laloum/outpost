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

| Name      | Type     | Presence | Meaning                                                                                                                                    |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`    | `string` | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                        |
| `version` | `string` | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes. |

## Signature

```ts
export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
