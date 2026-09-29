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

Inspect local recovery storage and compute which clean workspaces or closed logs satisfy the supplied age and capacity policy. Planning reports eligibility and projected usage without removing files.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                          | Presence | Meaning                                                                                                                   |
| --------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRetentionOptions`    | Required | Repository to inspect, explicit retention policy and scan bound.                                                          |
| `options.transporter` | `Transport \| undefined`      | Optional | Inspect remote objects and plan retention of closed journals. Local workspace cleanup is unsupported in transport mode.   |
| `options.repository`  | `string \| undefined`         | Optional | Target host Git checkout.                                                                                                 |
| `options.policy`      | `RecoveryRetentionPolicy`     | Required | Explicit storage scopes, minimum age and capacity targets used to decide retention eligibility.                           |
| `options.maxEntries`  | `number \| undefined`         | Optional | Maximum filesystem entries inspected before marking the inventory incomplete.                                             |
| `observation`         | `ObservationHub \| undefined` | Optional | Optional hub receiving start and terminal events for retention planning; never persisted in the recovery plan or archive. |

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
