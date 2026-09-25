---
title: "fileWorkflowCheckpointStore"
description: "fileWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **fileWorkflowCheckpointStore**. Consultez le [guide checkpoints de workflow](../../guide/advanced/checkpoints/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { fileWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister les résultats sans perte et rouvrir explicitement le même graphe après redémarrage.

Les sorties terminées ne sont pas rejouées. Une tâche ordinaire interrompue exige retry-incomplete. Les sorties doivent être du JSON sans perte ; les résultats de dispatch complets contiennent des fonctions et ne peuvent pas être persistés directement.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom                 | Type                            | Présence | Rôle                                                                                          |
| ------------------- | ------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `options`           | `FileWorkflowCheckpointOptions` | Requis   | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.directory` | `string`                        | Requis   | Dossier utilisé par l’opération ; voir les règles de résolution.                              |

## Retour

`WorkflowCheckpointStore`

## Signature

```ts
export declare function fileWorkflowCheckpointStore(
  options: FileWorkflowCheckpointOptions,
): WorkflowCheckpointStore;
```

## Contrats associés

- [FileWorkflowCheckpointOptions](../fileworkflowcheckpointoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
