---
title: "WorkflowTerminationCode"
description: "WorkflowTerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowTerminationCode } from "@elie-laloum/outpost";
```

## Rôle et comportement

Motif d’une terminaison de workflow sans succès, exposé sur WorkflowResult, les événements finish et WorkflowFailure.code. Utilise FaultCode, failed pour les erreurs non classées et usage-unavailable pour une comptabilité de budget incomplète. Les exécutions réussies ou suspendues n’ont pas de code de terminaison.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Signature

```ts
export type WorkflowTerminationCode =
  FaultCode | "failed" | "usage-unavailable";
```

## Contrats associés

- [FaultCode](../faultcode/)
