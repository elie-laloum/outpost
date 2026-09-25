---
title: "WorkflowCheckpointValue"
description: "WorkflowCheckpointValue — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowCheckpointValue**. Consultez le [guide checkpoints de workflow](../../guide/advanced/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowCheckpointValue } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister les résultats sans perte et rouvrir explicitement le même graphe après redémarrage.

Les sorties terminées ne sont pas rejouées. Une tâche ordinaire interrompue exige retry-incomplete. Les sorties doivent être du JSON sans perte ; les résultats de dispatch complets contiennent des fonctions et ne peuvent pas être persistés directement.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom    | Type                    | Présence | Rôle                                                                             |
| ------ | ----------------------- | -------- | -------------------------------------------------------------------------------- |
| `kind` | `"undefined" \| "json"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type WorkflowCheckpointValue =
  | {
      readonly kind: "undefined";
    }
  | {
      readonly kind: "json";
      readonly value: WorkflowJson;
    };
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
