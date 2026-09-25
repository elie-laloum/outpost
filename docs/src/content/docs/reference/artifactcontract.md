---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 10
---

Public contract for **ArtifactContract**. See the [typed artifacts guide](../../guide/advanced/artifacts/) for behavior, defaults and examples.

## Import

```ts
import type { ArtifactContract } from "@elie-laloum/outpost";
```

## Purpose and behavior

Publish immutable payloads and exchange small references with contract, digest and lineage validation.

Filesystem payloads default to 16 MiB maximum. Callers own retention. Digests provide integrity against a trusted reference, not producer authentication or a shared transaction.

[Complete example and detailed rules](../../guide/advanced/artifacts/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                 |
| ---------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Required | See the linked contract and this family's rules for its interpretation. |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Required | See the linked contract and this family's rules for its interpretation. |
| `name`     | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `version`  | `string`                            | Required | Caller-controlled contract or graph version.                            |
| `encoding` | `"json" \| "binary"`                | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
