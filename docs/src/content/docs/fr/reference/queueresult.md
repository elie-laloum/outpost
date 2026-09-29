---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                      | Présence  | Rôle                                                                                                                                                              |
| ------- | ------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value` | `WorkflowJson`            | Requis    | Valeur JSON produite par le handler, 262144 octets au plus une fois sérialisée ; runQueueWorker() enregistre null quand le handler lève une erreur.               |
| `usage` | `Usage \| undefined`      | Optionnel | Compteurs de jetons (input, output, cached, cacheCreated) que defineQueuedTask() ajoute à l’usage du workflow.                                                    |
| `error` | `string \| undefined`     | Optionnel | Message d’échec, 512 caractères au plus ; sa présence marque le job failed. runQueueWorker() le remplit à partir d’une erreur levée.                              |
| `quota` | `QueueQuota \| undefined` | Optionnel | Limite d’usage ou de débit ayant fait échouer le handler, avec son heure de réinitialisation et sa conversation capturée lorsqu’elles sont connues ; exige error. |

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
  /** Present when the handler failed on a usage or rate limit. */
  readonly quota?: QueueQuota;
}
```

## Contrats associés

- [QueueQuota](../queuequota/)
- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
