---
title: "artifactStore"
description: "artifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { artifactStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build an ArtifactStore over a transport. Publication creates immutable blobs or accepts identical existing bytes; conflicts with different bytes fail. Existing artifact contracts and portable references remain unchanged.

[Complete example and detailed rules](../../guide/operations/storage-transports/).

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
export declare function artifactStore(
  options: ArtifactStoreOptions,
): ArtifactStore;
```

## Related contracts

- [ArtifactStore](../artifactstore/)
- [ArtifactStoreOptions](../artifactstoreoptions/)
