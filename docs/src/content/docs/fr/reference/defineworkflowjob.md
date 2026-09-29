---
title: "defineWorkflowJob"
description: "defineWorkflowJob — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineWorkflowJob } from "@elie-laloum/outpost";
```

## Rôle et comportement

Renvoie un handler de file qui construit un workflow à partir de l’entrée de chaque job de déclencheur et le démarre avec le runId du job comme exécution de checkpoint, le signal du job et une version combinant checkpoint.version et une empreinte de l’entrée. La valeur du job résume l’exécution, y compris cette version et les gates en attente ; les workflows failed ou cancelled terminent le job avec une erreur.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                  | Type                                                                                  | Présence  | Rôle                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowJobOptions`                                                                  | Requis    | Fabrique de workflow, réglages de checkpoint et options de démarrage.                                                                                      |
| `options.workflow`   | `(input: WorkflowJson, context: WorkflowJobContext) => Workflow \| Promise<Workflow>` | Requis    | Construit le workflow pour une entrée de job ; la même entrée doit construire le même workflow, et la fabrique peut être asynchrone.                       |
| `options.checkpoint` | `WorkflowJobCheckpoint`                                                               | Requis    | Stockage et version de checkpoint utilisés pour chaque job ; obligatoire.                                                                                  |
| `options.start`      | `WorkflowJobStartOptions \| undefined`                                                | Optionnel | Autres options de démarrage du workflow, comme concurrency, budget, onQuota ou timeoutMs ; checkpoint, signal, decisions et answers sont gérés par le job. |

## Retour

`QueueHandler`

## Signature

```ts
export declare function defineWorkflowJob(
  options: WorkflowJobOptions,
): QueueHandler;
```

## Contrats associés

- [QueueHandler](../queuehandler/)
- [WorkflowJobOptions](../workflowjoboptions/)
