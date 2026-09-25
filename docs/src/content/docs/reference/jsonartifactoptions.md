---
title: "JsonArtifactOptions"
description: "JsonArtifactOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { JsonArtifactOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                                                                          |
| --------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `name`    | `string`                                                        | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `version` | `string`                                                        | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Boundary validator that narrows unknown input.                                                   |

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Related contracts

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
