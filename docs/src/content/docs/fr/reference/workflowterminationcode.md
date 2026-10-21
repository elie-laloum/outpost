---
title: "WorkflowTerminationCode"
description: "WorkflowTerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowTerminationCode } from "@elie-laloum/outpost/workflows";
```

## Rôle et comportement

Motif d’une terminaison de workflow sans succès, exposé sur WorkflowResult, les événements finish et WorkflowFailure.code. Utilise FaultCode, failed pour les erreurs non classées et usage-unavailable pour une comptabilité de budget incomplète. Les exécutions réussies ou suspendues n’ont pas de code de terminaison. Nom compatible du type commun TerminationCode.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Signature

```ts
export type WorkflowTerminationCode = TerminationCode;
```

## Contrats associés

- [TerminationCode](../terminationcode/)
