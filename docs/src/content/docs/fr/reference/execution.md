---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Execution**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Execution } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                             |
| -------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `text`         | `string`              | Requis    | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `turns`        | `readonly Turn[]`     | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `usage`        | `Usage`               | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `conversation` | `string \| undefined` | Optionnel | Identité de conversation native disponible.                                      |
| `value`        | `T`                   | Requis    | Valeur typée produite ou consommée par ce contrat.                               |
| `completed`    | `boolean`             | Requis    | Indique si le marqueur de fin configuré a été détecté.                           |
| `completion`   | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
