---
title: "Retention and quotas"
description: "Plan cleanup and coordinate storage admission."
---

Retention is explicit. Preview a policy before applying deletion; do not remove `.outpost` as routine cleanup after an interrupted run.

```sh
npx outpost recovery prune --repository /projects/app --policy retention.json --json
```

## Define a policy

Build `retention.json` from `RecoveryRetentionPolicy`: select the age and size limits appropriate for your recovery requirements. The command previews by default. Add `--apply` to execute the reviewed policy.

`planRecoveryRetention()` produces a plan. `pruneRecoveryRetention()` rechecks candidates and ownership before removing eligible data. Active, uncertain or recoverable work is not equivalent to expired closed logs.

This policy targets closed logs older than seven days, with a retained-storage target of 1 GiB. It does not make active or protected data eligible.

```json title="retention.json"
{
  "version": 1,
  "scopes": ["closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824
}
```

## Reserve capacity

`assertRecoveryQuota()` checks observed storage. `reserveRecoveryStorage()` coordinates cooperating writers with explicit byte and entry reservations. A workspace can own a reservation through `storageQuota`.

Reservations are admission accounting, not filesystem quotas. Uncooperative writers can exceed them. Abandoned reservations and checkpoint ownership require explicit recovery after independently stopping the former owner. Remote activity cannot establish liveness from a PID.

API: [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/).
