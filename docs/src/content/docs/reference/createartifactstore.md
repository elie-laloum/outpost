---
title: "createArtifactStore"
description: "createArtifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createArtifactStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an ArtifactStore that keeps each artifact as the immutable object artifacts/&lt;id>.blob. Publishing an existing id succeeds only with identical bytes, otherwise it rejects with Existing object content integrity mismatch; reading a missing id rejects with Artifact does not exist.

[Complete example and detailed rules](../../guide/artifacts/).

## Parameters and properties

| Name                  | Type                   | Presence | Meaning                                                                                                                    |
| --------------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ArtifactStoreOptions` | Required | Transport and per-artifact payload bound for immutable publication and verified reads.                                     |
| `options.maxBytes`    | `number \| undefined`  | Optional | Positive maximum artifact size in bytes, default 16 MiB; enforced before publication and while reading.                    |
| `options.transporter` | `Transport`            | Required | Caller-owned object transport used by the store or operation. Closing a workflow or sandbox does not close this transport. |

## Returns

`ArtifactStore`

## Signature

```ts
export declare function createArtifactStore(
  options: ArtifactStoreOptions,
): ArtifactStore;
```

## Related contracts

- [ArtifactStore](../artifactstore/)
- [ArtifactStoreOptions](../artifactstoreoptions/)
