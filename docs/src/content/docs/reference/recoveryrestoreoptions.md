---
title: "RecoveryRestoreOptions"
description: "RecoveryRestoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                       | Presence | Meaning                                                                                              |
| ------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `directory`   | `string`                   | Required | Host directory containing the retained transfer artifacts to verify or restore.                      |
| `repository`  | `string`                   | Required | Target host Git checkout.                                                                            |
| `destination` | `string`                   | Required | New, absent destination directory outside the source repository, Git metadata and retained transfer. |
| `side`        | `"previous" \| "incoming"` | Required | Retained state to restore: previous host state or incoming remote state.                             |
| `maxBytes`    | `number \| undefined`      | Optional | Maximum retained payload bytes allowed when snapshotting and verifying restoration sources.          |

## Signature

```ts
export interface RecoveryRestoreOptions {
  readonly directory: string;
  readonly repository: string;
  readonly destination: string;
  readonly side: "previous" | "incoming";
  readonly maxBytes?: number;
}
```
