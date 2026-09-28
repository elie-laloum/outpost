---
title: "LoopRoundRecord"
description: "LoopRoundRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LoopRoundRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                                   | Présence  | Rôle                                                                                                                                               |
| -------- | -------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `round`  | `number`                               | Requis    | Tour logique numéroté à partir de un, enregistré dans l’ordre d’exécution.                                                                         |
| `phase`  | `"complete" \| "attempt" \| "check"`   | Requis    | Dernière transition sauvegardée : attempt attend un candidat, check en possède un, complete possède une décision de vérification.                  |
| `output` | `WorkflowCheckpointValue \| undefined` | Optionnel | Résultat candidat encodé et sauvegardé avant vérification avec les checkpoints ; absent pour les boucles en mémoire seule et les essais inachevés. |
| `check`  | `LoopCheckResult \| undefined`         | Optionnel | Décision d’acceptation ou de refus d’un tour terminé, avec feedback en cas de refus.                                                               |

## Signature

```ts
export interface LoopRoundRecord {
  readonly round: number;
  readonly phase: "attempt" | "check" | "complete";
  readonly output?: WorkflowCheckpointValue;
  readonly check?: LoopCheckResult;
}
```

## Contrats associés

- [LoopCheckResult](../loopcheckresult/)
- [WorkflowCheckpointValue](../workflowcheckpointvalue/)
