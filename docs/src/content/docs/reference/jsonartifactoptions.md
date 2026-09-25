---
title: "JsonArtifactOptions"
description: "JsonArtifactOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **JsonArtifactOptions**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { JsonArtifactOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name      | Type                                                            | Presence | Meaning                                                                 |
| --------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `name`    | `string`                                                        | Required | See the linked contract and this family's rules for its interpretation. |
| `version` | `string`                                                        | Required | Caller-controlled contract or graph version.                            |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Required | Boundary validator that narrows unknown input.                          |

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Related contracts

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
