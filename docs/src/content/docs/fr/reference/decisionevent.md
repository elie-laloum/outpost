---
title: "DecisionEvent"
description: "DecisionEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                  | Présence  | Rôle                                                                                          |
| ------------ | ------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `kind`       | `"decision"`                          | Requis    | Discriminant decision du cycle de vie de décision.                                            |
| `status`     | `"started" \| "finished" \| "failed"` | Requis    | Started avant la requête, finished après validation, ou failed lors du rejet de l’évaluation. |
| `provider`   | `string`                              | Requis    | Nom du provider de décision ; aucun identifiant secret n’est inclus.                          |
| `model`      | `string`                              | Requis    | Modèle demandé au démarrage/en erreur et modèle réellement renvoyé en cas de succès.          |
| `durationMs` | `number \| undefined`                 | Optionnel | Durée d’évaluation écoulée en millisecondes en fin d’exécution ou en erreur.                  |
| `usage`      | `Usage \| undefined`                  | Optionnel | Reçu d’usage normalisé validé lorsqu’il est disponible.                                       |
| `truncated`  | `boolean \| undefined`                | Optionnel | Indicateur de troncature d’entrée lorsque le provider le signale.                             |
| `code`       | `string \| undefined`                 | Optionnel | Code d’erreur Outpost lors d’une évaluation en échec, lorsque l’erreur en possède un.         |

## Signature

```ts
export interface DecisionEvent {
  readonly kind: "decision";
  readonly status: "started" | "finished" | "failed";
  readonly provider: string;
  readonly model: string;
  readonly durationMs?: number;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly code?: string;
}
```

## Contrats associés

- [Usage](../usage/)
