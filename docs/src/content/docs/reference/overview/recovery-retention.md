---
title: "Recovery and retention — Overview"
description: "Recovery data preserves work when normal cleanup would discard useful evidence or changes."
sidebar:
  label: Overview
  order: 0
---

Recovery data preserves work when normal cleanup would discard useful evidence or changes. Retention decides which stored data can be removed later. These are separate concerns: failing to complete an operation should not automatically destroy the material needed to understand or recover it.

## How it works

Verify a retained transfer before considering restoration. Retention planning describes candidates and reasons without deleting them. Pruning performs the explicit removal step after reacquiring ownership and revalidating candidates. Quota checks report observed storage against a configured limit.

## Boundaries and responsibilities

A plan can become stale as other operations run. Retention is not a backup policy, and observed storage checks are not physical filesystem quotas. Use the restoration family when the goal is applying retained data, rather than deleting it.

## Entry points

- [verifyRecoveryTransfer](../../verifyrecoverytransfer/)
- [planRecoveryRetention](../../planrecoveryretention/)
- [pruneRecoveryRetention](../../prunerecoveryretention/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [RecoveryRetentionPlan](../../recoveryretentionplan/)

[Learn with the practical guide](../../../guide/operations/recovery/).
