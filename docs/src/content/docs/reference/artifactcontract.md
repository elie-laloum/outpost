---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactContract } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                                          |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Required | Validate and serialize a typed value into immutable artifact bytes.                              |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Required | Decode stored bytes and validate them as the contract’s value type.                              |
| `name`     | `string`                            | Required | Nonempty artifact contract name, at most 1024 characters.                                        |
| `version`  | `string`                            | Required | Nonempty caller-defined contract version, at most 1024 characters; reads require an exact match. |
| `encoding` | `"json" \| "binary"`                | Required | Payload representation required by the artifact contract: json or binary.                        |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
