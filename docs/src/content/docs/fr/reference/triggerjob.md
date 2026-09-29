---
title: "TriggerJob"
description: "TriggerJob — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerJob } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                        | Présence  | Rôle                                                                                                                     |
| --------- | --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `handler` | `string`                    | Requis    | Handler enregistré du worker de file, généralement un defineWorkflowJob().                                               |
| `runId`   | `string`                    | Requis    | Exécution de checkpoint, de 1 à 256 caractères ; les événements d’une même exécution convergent vers un seul checkpoint. |
| `input`   | `WorkflowJson \| undefined` | Optionnel | Entrée JSON sans perte pour le workflow ; null par défaut.                                                               |

## Signature

```ts
export interface TriggerJob {
  /** Registered queue worker handler, usually a `defineWorkflowJob()`. */
  readonly handler: string;
  /** Checkpoint run identifier; events for the same run converge on one checkpoint. */
  readonly runId: string;
  readonly input?: WorkflowJson;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
