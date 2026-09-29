---
title: "Resource activity — Overview"
description: "Observed sandbox phases and running operations, recorded while a sandbox lives, and the inspection that judges who still owns them."
sidebar:
  label: Overview
  order: 0
---

## What a record’s phase means

Outpost writes one record per sandbox under `resources/` before the provider allocates it, and removes it after a clean close. A record still present marks a sandbox that is running or did not close cleanly.

| `phase`                | Meaning                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `allocating`           | The provider is acquiring the sandbox; seeding and ready hooks follow                 |
| `ready`                | The sandbox is set up; `operations` lists what is running now                         |
| `closing`              | Release is in progress, after `close()` or a startup failure                          |
| `cleanup-failed`       | Release, operation settlement or workspace close failed; the workspace is kept        |
| `allocation-uncertain` | Startup failed during acquisition: the provider may hold a sandbox Outpost never used |

## How ownership is judged

`inspectRecovery({ resources: true })` reads the repository’s records and compares each writer’s process identity with the current process. With `transporter`, it reads the records stored through `activityTransport` and never infers ownership from a PID.

| `ownership.status` | `reason`                                                   | When                                                                    |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `active`           | `LOCAL_IDENTITY_MATCH`                                     | Same host, boot and PID namespace; the PID runs with its recorded start |
| `inactive`         | `PROCESS_EXITED`                                           | Same host, boot and PID namespace; no process has the PID               |
| `unknown`          | `PID_REUSED`                                               | The PID belongs to a process with another start time                    |
| `unknown`          | `OTHER_HOST`, `OTHER_BOOT`, `OTHER_PID_NAMESPACE`          | The record comes from another machine, boot or container                |
| `unknown`          | `LEGACY_OR_INVALID_IDENTITY`, `LOCAL_IDENTITY_UNAVAILABLE` | The writer or the inspector has no identity; it is read on Linux only   |
| `unknown`          | `PROCESS_INACCESSIBLE`, `PROCESS_IDENTITY_UNAVAILABLE`     | The PID exists but cannot be signalled or read                          |
| `unknown`          | `REMOTE_OWNER_UNVERIFIED`                                  | Every record read from a transport                                      |
| `unknown`          | `RESOURCE_RECORD_UNREADABLE`                               | The record is invalid or changed during inspection                      |

:::caution
An `inactive` or `unknown` record does not prove the provider’s sandbox is gone. Inspection never queries the provider: check its console before deleting a `remote` or `allocation-uncertain` sandbox.
:::

## Entry points

Guide: [Recover work](../../../guide/recovery/) · [Where data lives](../../../guide/storage/)

- [inspectRecovery](../../inspectrecovery/)
- [RecoveryInspectionOptions](../../recoveryinspectionoptions/)
- [RecoveryInspection](../../recoveryinspection/)
- [ResourceInspection](../../resourceinspection/)
- [ResourceInspectionEntry](../../resourceinspectionentry/)
- [ResourceActivityRecord](../../resourceactivityrecord/)
- [ResourcePhase](../../resourcephase/)
- [ResourceOperation](../../resourceoperation/)
- [ResourceOperationResult](../../resourceoperationresult/)
