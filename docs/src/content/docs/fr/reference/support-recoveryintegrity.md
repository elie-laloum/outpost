---
title: "RecoveryIntegrity"
description: "RecoveryIntegrity — Outpost API"
sidebar:
  order: 10
---

## Rôle et comportement

Verdict de sommes de contrôle de verifyRecoveryTransfer() pour un répertoire de recovery. Valeurs : "unverified" (sommes non demandées, ou manifeste absent, invalide ou illisible, ou maxBytes atteint), "checksums-match" (chaque entrée correspond au type, à la taille et au SHA-256 enregistrés), "checksums-mismatch" (au moins une entrée diffère). Les archives de recovery et les instantanés de restauration exigent "checksums-match".

## Signature

```ts
export type RecoveryIntegrity =
  "unverified" | "checksums-match" | "checksums-mismatch";
```
