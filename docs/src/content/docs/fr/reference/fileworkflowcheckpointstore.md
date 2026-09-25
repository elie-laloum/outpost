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

Crée un store de checkpoints avec exactement un dossier ou un transport. Le mode dossier conserve les fichiers JSON existants, le remplacement atomique et les verrous locaux. Le mode transport délègue à workflowCheckpointStore et utilise des enveloppes conditionnelles à récupération explicite. Changer de mode ne migre pas les exécutions.

[Exemple complet et règles détaillées](../../guide/advanced/checkpoints/).

## Paramètres et propriétés

| Nom                   | Type                            | Présence  | Rôle                                                                                                                                                    |
| --------------------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `FileWorkflowCheckpointOptions` | Requis    | Exactement un choix de dossier historique ou transport objet. Chaque mode conserve son format et son mécanisme de propriété.                            |
| `options.directory`   | `string \| undefined`           | Optionnel | Dossier des anciens checkpoints et verrous de processus locaux, exclusif avec transporter ; le format JSON existant est conservé.                       |
| `options.transporter` | `Transport \| undefined`        | Optionnel | Alternative à directory ; utilise l’enveloppe de checkpoint du transport et une récupération explicite de propriété. Fournir un seul choix de stockage. |

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
