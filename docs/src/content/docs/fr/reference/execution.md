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

| Nom            | Type                  | Présence  | Rôle                                                                                            |
| -------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `text`         | `string`              | Requis    | Texte final rapporté par l’exécution de l’agent.                                                |
| `turns`        | `readonly Turn[]`     | Requis    | Résultats ordonnés des tours d’agent : texte, statut, durée et usage de tokens de chaque passe. |
| `usage`        | `Usage`               | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                                      |
| `conversation` | `string \| undefined` | Optionnel | Identité de conversation native disponible.                                                     |
| `value`        | `T`                   | Requis    | Valeur de réponse structurée validée ; undefined en l’absence de spécification de réponse.      |
| `completed`    | `boolean`             | Requis    | Indique si le marqueur de fin configuré a été détecté.                                          |
| `completion`   | `string \| undefined` | Optionnel | Marqueur de fin correspondant à la sortie de l’agent lorsqu’il a été trouvé.                    |

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
