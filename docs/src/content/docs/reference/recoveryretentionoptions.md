---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                      | Presence | Meaning                                                                                                                                                                                             |
| ------------- | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined`  | Optional | Plan over this transport's objects instead of the repository's .outpost. Only closed-logs and task-cache apply; clean-workspaces or maxWorkspaces reject with code configuration.                   |
| `repository`  | `string \| undefined`     | Optional | Git checkout whose .outpost is inspected, default process.cwd(), resolved to its top-level directory; a missing directory rejects with code workspace. With transporter, only recorded in the plan. |
| `policy`      | `RecoveryRetentionPolicy` | Required | Scopes, minimum age and limits deciding which entries are eligible. Validated before inspection; an invalid or unknown field rejects with code configuration.                                       |
| `maxEntries`  | `number \| undefined`     | Optional | Maximum files and directories scanned under .outpost, or objects listed from transporter, default 100000. Exceeding it marks the plan incomplete, so no entry is eligible.                          |

## Signature

```ts
export interface RecoveryRetentionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly maxEntries?: number;
}
```

## Related contracts

- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
- [Transport](../transport/)
