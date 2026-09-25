---
title: "Storage reservations — Overview"
description: "A storage reservation coordinates admission before cooperating operations write recovery data."
sidebar:
  label: Overview
  order: 0
---

A storage reservation coordinates admission before cooperating operations write recovery data. It records an intended storage claim so separate writers can account for one another, instead of all making decisions from the same stale inventory.

## How it works

`reserveRecoveryStorage` returns a reservation with an explicit lifetime. Its options describe admission limits and ownership. A workspace can own the reservation as part of its resource lifecycle; other callers must release the reservations they own.

## Boundaries and responsibilities

Reservations coordinate cooperating writers; they cannot constrain arbitrary processes or guarantee free disk space. Keep them separate from retention, which removes stored data, and quota inspection, which observes current storage. A reservation is not a physical filesystem quota.

## Entry points

- [reserveRecoveryStorage](../../reserverecoverystorage/)
- [RecoveryStorageReservationOptions](../../recoverystoragereservationoptions/)
- [StorageReservation](../../storagereservation/)
- [StorageReservationOptions](../../storagereservationoptions/)

[Learn with the practical guide](../../../guide/operations/storage-retention/).
