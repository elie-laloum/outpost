---
title: "RecordedCommit"
description: "RecordedCommit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedCommit } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type               | Presence | Meaning                                                                                              |
| ----------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `oid`       | `string`           | Required | Object ID of the recorded commit.                                                                    |
| `tree`      | `string`           | Required | Tree ID the patch must reproduce.                                                                    |
| `author`    | `RecordedIdentity` | Required | Author identity and date restored on the replayed commit.                                            |
| `committer` | `RecordedIdentity` | Required | Committer identity and date restored on the replayed commit.                                         |
| `message`   | `string`           | Required | Exact commit message, without cleanup.                                                               |
| `patch`     | `string`           | Required | Binary Git patch from the parent commit, verified at record time; empty for commits without changes. |

## Signature

```ts
export interface RecordedCommit {
  readonly oid: string;
  readonly tree: string;
  readonly author: RecordedIdentity;
  readonly committer: RecordedIdentity;
  readonly message: string;
  readonly patch: string;
}
```

## Related contracts

- [RecordedIdentity](../recordedidentity/)
