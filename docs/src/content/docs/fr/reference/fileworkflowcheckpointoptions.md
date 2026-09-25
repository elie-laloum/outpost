---
title: "FileWorkflowCheckpointOptions"
description: "FileWorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **FileWorkflowCheckpointOptions**. Consultez le [guide checkpoints de workflow](../../guide/advanced/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { FileWorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister les résultats sans perte et rouvrir explicitement le même graphe après redémarrage.

Les sorties terminées ne sont pas rejouées. Une tâche ordinaire interrompue exige retry-incomplete. Les sorties doivent être du JSON sans perte ; les résultats de dispatch complets contiennent des fonctions et ne peuvent pas être persistés directement.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom         | Type     | Présence | Rôle                                                             |
| ----------- | -------- | -------- | ---------------------------------------------------------------- |
| `directory` | `string` | Requis   | Dossier utilisé par l’opération ; voir les règles de résolution. |

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory: string;
}
```
