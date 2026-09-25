---
title: "Recovery restoration — Overview"
description: "Restoration applies retained transfer data to an explicit repository after normal synchronization could not complete."
sidebar:
  label: Overview
  order: 0
---

Restoration applies retained transfer data to an explicit repository after normal synchronization could not complete. Its purpose is to recover work deliberately, with a reviewable plan, instead of treating a failed transfer as permission to overwrite the host checkout.

## How it works

`planRecoveryRestore` describes the proposed restoration and its prerequisites. `restoreRecoveryTransfer` performs the application step under its ownership and validation rules. Transfer verification is a separate prerequisite; the plan and result expose what is being applied and what happened.

## Boundaries and responsibilities

A retained directory is evidence to inspect, not proof that all required data exists. Verify the transfer and target repository first. Concurrent host changes must remain protected, and recoverable artifacts must survive failures that prevent safe completion.

## Entry points

- [planRecoveryRestore](../../planrecoveryrestore/)
- [restoreRecoveryTransfer](../../restorerecoverytransfer/)
- [RecoveryRestoreOptions](../../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../../recoveryrestoreplan/)
- [RecoveryRestoreResult](../../recoveryrestoreresult/)

[Learn with the practical guide](../../../guide/operations/recovery-restoration/).
