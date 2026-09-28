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
| `value` | `WorkflowJson`            | Requis    | Sortie JSON sans perte produite par le gestionnaire du worker.                                                                                                    |
| `usage` | `Usage \| undefined`      | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                                                                                                        |
| `error` | `string \| undefined`     | Optionnel | Message d’échec du worker ; sa présence fait enregistrer le travail comme failed à la finalisation.                                                               |
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
