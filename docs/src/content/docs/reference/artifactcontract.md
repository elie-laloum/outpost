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

| Name       | Type                                | Presence | Meaning                                                                                                                                    |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Required | Validate a value and return the bytes to store. Rejects a value the contract does not accept.                                              |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Required | Turn stored bytes back into a validated value. Rejects bytes the contract does not accept.                                                 |
| `name`     | `string`                            | Required | Contract name, nonempty and at most 1024 characters. A read requires the same name.                                                        |
| `version`  | `string`                            | Required | Contract version you choose, nonempty and at most 1024 characters. A read requires the same version, so change it when the format changes. |
| `encoding` | `"json" \| "binary"`                | Required | json for a defineJsonArtifact() contract, binary for a defineBinaryArtifact() contract. A read requires the same encoding.                 |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Related contracts

- [ArtifactIdentity](../artifactidentity/)
