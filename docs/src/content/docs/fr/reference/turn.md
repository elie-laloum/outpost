---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Turn**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                             |
| -------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `text`         | `string`              | Requis    | Contenu textuel ; sa provenance dépend de l’opération.                           |
| `status`       | `number`              | Requis    | Résultat enregistré du processus ou cycle de vie ; voir son type.                |
| `conversation` | `string \| undefined` | Optionnel | Identité de conversation native disponible.                                      |
| `transcript`   | `string \| undefined` | Optionnel | Chemin hôte disponible du transcript capturé.                                    |
| `usage`        | `Usage`               | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `durationMs`   | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly transcript?: string;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Contrats associés

- [Usage](../usage/)
