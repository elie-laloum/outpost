---
title: "Storage reservations — Overview"
description: "Claim bytes in a shared ledger before writing, so cooperating writers stay within one limit under a repository’s .outpost."
sidebar:
  label: Overview
  order: 0
---

## What counts toward maxBytes

Admission succeeds when observed usage, active reservations and `reserveBytes` together stay at or below `maxBytes`. The ledger object is `reservations/ledger` in the chosen transport.

| Term                | Default transport (`.outpost/storage`)                                            | Explicit `transporter`                                 |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Observed usage      | File bytes under `.outpost/recovery`, `logs`, `locks`, `workspaces` and `storage` | Sizes of every listed object, except the ledger        |
| Active reservations | Sum of `reserveBytes` of every entry in the ledger, including abandoned ones      | Same                                                   |
| Scan limit          | `maxEntries` files and directories, default 100000; an incomplete scan is refused | `maxEntries` objects, default 100000; more are refused |

:::caution
A reservation binds only writers that reserve. It is not a filesystem quota: other processes can still write to `.outpost` or fill the disk.
:::

## How a reservation ends

| Event                                                               | Outcome                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Request fits                                                        | Entry added by a conditional write; resolves with a `StorageReservation` |
| Over `maxBytes`, incomplete scan, invalid options, malformed ledger | Rejects with code `configuration`                                        |
| 100 conflicting ledger writes in a row                              | Rejects with `Storage reservation contention limit exceeded`             |
| `signal` aborted before the entry is written                        | Rejects with the abort reason                                            |
| `release()` or the end of an `await using` scope                    | Entry removed; later calls do nothing                                    |
| Owner stops without releasing                                       | Entry stays and keeps counting; it never expires                         |

:::caution
Outpost has no call that clears an abandoned reservation. After confirming its owner stopped, remove its id from `reservations/ledger` with a conditional write through the same transport.
:::

## Entry points

Guide: [Retention and cleanup](../../../guide/retention/) · [Where data lives](../../../guide/storage/)

- [reserveRecoveryStorage](../../reserverecoverystorage/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [RecoveryStorageReservationOptions](../../recoverystoragereservationoptions/)
- [StorageReservationOptions](../../storagereservationoptions/)
- [StorageReservation](../../storagereservation/)
- [WorkspaceOptions](../../workspaceoptions/)
