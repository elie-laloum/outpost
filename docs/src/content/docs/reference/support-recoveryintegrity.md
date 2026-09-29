---
title: "RecoveryIntegrity"
description: "RecoveryIntegrity — Outpost API"
sidebar:
  order: 10
---

## Purpose and behavior

Checksum verdict of verifyRecoveryTransfer() for a recovery directory. Values: "unverified" (checksums not requested, or the manifest is missing, invalid or unreadable, or maxBytes was reached), "checksums-match" (every entry matches its recorded kind, size and SHA-256), "checksums-mismatch" (at least one entry differs). Recovery archives and restore snapshots require "checksums-match".

## Signature

```ts
export type RecoveryIntegrity =
  "unverified" | "checksums-match" | "checksums-mismatch";
```
