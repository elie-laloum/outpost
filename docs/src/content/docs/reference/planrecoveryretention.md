---
title: "planRecoveryRetention"
description: "planRecoveryRetention — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRetention } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inventory the repository's .outpost, or a transport's objects, and mark each entry eligible or kept with a reason code under the policy. Removes nothing; an incomplete inventory makes every entry ineligible and quota unknown. An invalid policy, or clean-workspaces or maxWorkspaces with a transporter, rejects with code configuration.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                  | Type                          | Presence | Meaning                                                                                                                                                                                             |
| --------------------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRetentionOptions`    | Required | Repository or transporter to inspect, retention policy and scan limit.                                                                                                                              |
| `options.transporter` | `Transport \| undefined`      | Optional | Plan over this transport's objects instead of the repository's .outpost. Only closed-logs and task-cache apply; clean-workspaces or maxWorkspaces reject with code configuration.                   |
| `options.repository`  | `string \| undefined`         | Optional | Git checkout whose .outpost is inspected, default process.cwd(), resolved to its top-level directory; a missing directory rejects with code workspace. With transporter, only recorded in the plan. |
| `options.policy`      | `RecoveryRetentionPolicy`     | Required | Scopes, minimum age and limits deciding which entries are eligible. Validated before inspection; an invalid or unknown field rejects with code configuration.                                       |
| `options.maxEntries`  | `number \| undefined`         | Optional | Maximum files and directories scanned under .outpost, or objects listed from transporter, default 100000. Exceeding it marks the plan incomplete, so no entry is eligible.                          |
| `observation`         | `ObservationHub \| undefined` | Optional | Hub receiving the started, then finished or failed, operation event retention.plan with its duration.                                                                                               |

## Returns

`Promise<RecoveryRetentionPlan>`

## Signature

```ts
export declare function planRecoveryRetention(
  options: RecoveryRetentionOptions,
  observation?: ObservationHub,
): Promise<RecoveryRetentionPlan>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryRetentionOptions](../recoveryretentionoptions/)
- [RecoveryRetentionPlan](../recoveryretentionplan/)
