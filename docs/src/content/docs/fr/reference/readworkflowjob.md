---
title: "readWorkflowJob"
description: "readWorkflowJob — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readWorkflowJob } from "@elie-laloum/outpost/queues";
```

## Rôle et comportement

Projette l’enregistrement d’un job de workflow en son statut de livraison dans la queue, son identifiant d’exécution et, dès qu’un handler a enregistré un résultat, le statut du workflow et la prochaine action. Un job done peut donc signaler un workflow paused ou waiting-input. Les résumés enregistrés avant l’ajout de workflowStatus sont lus depuis leur champ status ; un job sans résumé enregistré ne renvoie que jobStatus et runId. La lecture n’autorise jamais de rejeu ni de récupération.

[Exemple complet et règles détaillées](../../guide/queued-workflows/).

## Paramètres et propriétés

| Nom   | Type       | Présence | Rôle                                                                                                                                                      |
| ----- | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `job` | `QueueJob` | Requis   | Enregistrement de queue d’un job traité par defineWorkflowJob(), par exemple le résultat de queue.get() ; son entrée doit porter le runId du déclencheur. |

## Retour

`WorkflowJobState`

## Signature

```ts
export declare function readWorkflowJob(job: QueueJob): WorkflowJobState;
```

## Contrats associés

- [QueueJob](../queuejob/)
- [WorkflowJobState](../workflowjobstate/)
