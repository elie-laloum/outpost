---
title: "RunDispatch"
description: "RunDispatch — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunDispatch } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                             | Présence  | Rôle                                                                                            |
| ----------- | ------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------- |
| `id`        | `string`                                         | Requis    | Identité d’observation du dispatch ; plusieurs dispatchs gardent des fiches distinctes.         |
| `taskKey`   | `string \| undefined`                            | Optionnel | Clé de la tâche propriétaire depuis le contexte du dispatch, absente pour une requête autonome. |
| `attempt`   | `number \| undefined`                            | Optionnel | Tentative de la tâche propriétaire depuis le contexte du dispatch.                              |
| `status`    | `"failed" \| "done" \| "cancelled" \| "running"` | Requis    | Dernier résultat du cycle de vie du dispatch, indépendant du statut du workflow englobant.      |
| `agent`     | `string \| undefined`                            | Optionnel | Dernier nom d’agent observé via un événement de phase ou de repli.                              |
| `phase`     | `string \| undefined`                            | Optionnel | Dernière phase de l’agent principal observée ; les phases des sous-agents ne la remplacent pas. |
| `branch`    | `string \| undefined`                            | Optionnel | Branche nommée observée lorsqu’une phase ou fin d’exécution la fournit.                         |
| `completed` | `boolean \| undefined`                           | Optionnel | Indique si le dispatch a atteint son contrat de complétion, signalé uniquement à sa fin.        |
| `commits`   | `readonly Commit[]`                              | Requis    | Commits signalés à la fin du dispatch, y compris ceux conservés pour récupération après échec.  |
| `usage`     | `Usage`                                          | Requis    | Usage en cours cumulé des passages, remplacé par l’usage final du dispatch à sa fin.            |
| `passes`    | `readonly RunPass[]`                             | Requis    | Comptabilité par passage évitant de compter deux fois rapports cumulés et récapitulatifs.       |
| `error`     | `RunError \| undefined`                          | Optionnel | Erreur finale classée du dispatch lors d’un échec ou d’une annulation.                          |

## Signature

```ts
export interface RunDispatch {
  readonly id: string;
  readonly taskKey?: string;
  readonly attempt?: number;
  readonly status: "running" | "done" | "failed" | "cancelled";
  readonly agent?: string;
  readonly phase?: string;
  readonly branch?: string;
  readonly completed?: boolean;
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly passes: readonly RunPass[];
  readonly error?: RunError;
}
```

## Contrats associés

- [Commit](../commit/)
- [RunError](../runerror/)
- [RunPass](../runpass/)
- [Usage](../usage/)
