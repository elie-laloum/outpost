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

Renvoie un handler de file qui construit un workflow à partir de l’entrée de chaque job de déclencheur et le démarre sous le runId du job, avec le signal du job et checkpoint.version suivi d’une empreinte de l’entrée comme version de checkpoint. La valeur du job résume l’exécution (statut, tâches, gates en pause, demandes de saisie) avec son usage de tokens ; un workflow failed ou cancelled, ou un checkpoint incompatible, termine le job avec une erreur. La création lève une erreur sans fabrique de workflow, stockage et version de checkpoint. Son résumé inclut terminationCode pour les fins sans succès ; les workflows rejetés gardent le statut rejected dans la valeur et renvoient une erreur de file pour que le job ne paraisse pas réussi.

[Exemple complet et règles détaillées](../../guide/job-queues/).

## Paramètres et propriétés

| Nom                  | Type                                                                                  | Présence  | Rôle                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `WorkflowJobOptions`                                                                  | Requis    | Fabrique de workflow, réglages de checkpoint et options de démarrage.                                                                                      |
| `options.workflow`   | `(input: WorkflowJson, context: WorkflowJobContext) => Workflow \| Promise<Workflow>` | Requis    | Construit le workflow pour une entrée de job ; la même entrée doit construire le même workflow, et la fabrique peut être asynchrone.                       |
| `options.checkpoint` | `WorkflowJobCheckpoint`                                                               | Requis    | Stockage de checkpoint et version de base partagés par chaque job ; la création lève une erreur sans les deux.                                             |
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
