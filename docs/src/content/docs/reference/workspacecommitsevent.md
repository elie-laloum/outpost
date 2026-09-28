---
title: "WorkspaceCommitsEvent"
description: "WorkspaceCommitsEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkspaceCommitsEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                                                | Presence          | Meaning                                                                                                                                                            |
| ------------- | --------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kind`        | `"workspace-commits"`                               | Required          | Event discriminator for recorded workspace commits.                                                                                                                |
| `baseline`    | `RecordedRevision \| RecordedRevision \| undefined` | Variant-dependent | Commit and tree the sandbox dispatch started from; absent when even the baseline could not be read.                                                                |
| `commits`     | `readonly RecordedCommit[]`                         | Variant-dependent | Linear commits created by the dispatch, oldest first.                                                                                                              |
| `unavailable` | `string`                                            | Variant-dependent | Reason the commits were not recorded: non-linear or rewritten history, size limit, non-UTF-8 encoding, a patch that does not reproduce its tree, or a Git failure. |

## Signature

```ts
export type WorkspaceCommitsEvent =
  | {
      readonly kind: "workspace-commits";
      readonly baseline: RecordedRevision;
      readonly commits: readonly RecordedCommit[];
    }
  | {
      readonly kind: "workspace-commits";
      readonly baseline?: RecordedRevision;
      readonly unavailable: string;
    };
```

## Related contracts

- [RecordedCommit](../recordedcommit/)
- [RecordedRevision](../recordedrevision/)
