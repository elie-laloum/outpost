---
title: "S3TombstonePruneOptions"
description: "S3TombstonePruneOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { S3TombstonePruneOptions } from "@elie-laloum/outpost/transports/s3";
```

## Parameters and properties

| Name             | Type                       | Presence | Meaning                                                                                             |
| ---------------- | -------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `prefix`         | `string`                   | Required | Nonempty transport prefix; deletion is restricted to its descendants.                               |
| `writersStopped` | `true`                     | Required | Required true after stopping every writer sharing the prefix; keep them stopped until pruning ends. |
| `signal`         | `AbortSignal \| undefined` | Optional | Optional cancellation signal; completed deletions remain applied.                                   |
| `client`         | `S3Client`                 | Required | Caller-owned S3 client.                                                                             |
| `bucket`         | `string`                   | Required | Bucket containing the transport prefix.                                                             |

## Signature

```ts
export interface S3TombstonePruneOptions extends Pick<
  S3TransportOptions,
  "client" | "bucket"
> {
  readonly prefix: string;
  readonly writersStopped: true;
  readonly signal?: AbortSignal;
}
```

## Related contracts

- [S3TransportOptions](../s3transportoptions/)
