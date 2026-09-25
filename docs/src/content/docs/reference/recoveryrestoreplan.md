---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                           | Presence | Meaning                                                                                                    |
| ---------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| `fingerprint`    | `string`                       | Required | Fingerprint binding the plan to the inspected retained source for revalidation before restoration.         |
| `manifestSha256` | `string`                       | Required | SHA-256 of the retained transfer manifest captured during restoration planning.                            |
| `commit`         | `string`                       | Required | Git commit used to reconstruct the selected retained state.                                                |
| `payloads`       | `readonly string[]`            | Required | Retained bundle and patch paths required to restore the selected side.                                     |
| `staging`        | `"unavailable" \| "preserved"` | Required | Whether the original Git index is preserved; incoming remote state has no recoverable staging information. |
| `directory`      | `string`                       | Required | Host directory containing the retained transfer artifacts to verify or restore.                            |
| `repository`     | `string`                       | Required | Target host Git checkout.                                                                                  |
| `destination`    | `string`                       | Required | New, absent destination directory outside the source repository, Git metadata and retained transfer.       |
| `side`           | `"previous" \| "incoming"`     | Required | Retained state to restore: previous host state or incoming remote state.                                   |
| `maxBytes`       | `number \| undefined`          | Optional | Maximum retained payload bytes allowed when snapshotting and verifying restoration sources.                |

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Related contracts

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
