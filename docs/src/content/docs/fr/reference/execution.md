---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Execution } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                                                                 |
| -------------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `text`         | `string`              | Requis    | Texte de tous les tours de l'exécution, joints par des sauts de ligne, y compris les tours de réparation de réponse. |
| `turns`        | `readonly Turn[]`     | Requis    | Tous les tours dans l’ordre, y compris les corrections de réponse et les tours repris par le steering.               |
| `usage`        | `Usage`               | Requis    | Compteurs de tokens additionnés sur tous les tours ; pas un coût.                                                    |
| `conversation` | `string \| undefined` | Optionnel | Identifiant de conversation native du dernier tour, quand l’agent en a fourni un.                                    |
| `value`        | `T`                   | Requis    | Réponse analysée et validée ; undefined sans option response.                                                        |
| `completed`    | `boolean`             | Requis    | Vrai quand le texte du dernier tour contient un marqueur de fin, ou quand une réponse typée a été validée.           |
| `completion`   | `string \| undefined` | Optionnel | Marqueur de fin trouvé dans le texte du dernier tour.                                                                |

## Signature

```ts
export interface Execution<T> {
  readonly text: string;
  readonly turns: readonly Turn[];
  readonly usage: Usage;
  readonly conversation?: string;
  readonly value: T;
  readonly completed: boolean;
  readonly completion?: string;
}
```

## Contrats associés

- [Turn](../turn/)
- [Usage](../usage/)
