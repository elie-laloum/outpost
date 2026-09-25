---
title: "fileWorkflowCheckpointStore"
description: "fileWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fileWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un store de checkpoints dans directory. Acquérir un identifiant d’exécution donne la possession exclusive de son checkpoint ; les écritures remplacent atomiquement le JSON sauvegardé et la libération du bail conserve les résultats pour une exécution ultérieure.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom                 | Type                            | Présence | Rôle                                                                                |
| ------------------- | ------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `options`           | `FileWorkflowCheckpointOptions` | Requis   | Dossier dans lequel posséder et persister les fichiers de checkpoints.              |
| `options.directory` | `string`                        | Requis   | Dossier hôte utilisé pour persister les checkpoints et leurs verrous de possession. |

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
