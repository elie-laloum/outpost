---
title: "DiagnosticStatus"
description: "DiagnosticStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DiagnosticStatus } from "@elie-laloum/outpost";
```

## Rôle et comportement

Résultat d’un DiagnosticCheck dans les rapports de outpost doctor, diagnoseSandbox() et diagnoseAgentProtocol(). Valeurs : "pass" (vérification réussie), "warn" (problème qui n’empêche pas l’utilisation), "fail" (problème bloquant ; active hasFailures), "skipped" (sans objet pour ce provider ou cette configuration, par exemple les vérifications d’image sans image).

[Exemple complet et règles détaillées](../../guide/diagnostics/).

## Signature

```ts
export type DiagnosticStatus = "pass" | "warn" | "fail" | "skipped";
```
