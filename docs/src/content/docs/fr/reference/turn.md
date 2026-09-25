---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                       |
| -------------- | --------------------- | --------- | ---------------------------------------------------------- |
| `text`         | `string`              | Requis    | Texte rapporté pour cette passe d’agent.                   |
| `status`       | `number`              | Requis    | Code de sortie du processus ; zéro indique le succès.      |
| `conversation` | `string \| undefined` | Optionnel | Identité de conversation native disponible.                |
| `transcript`   | `string \| undefined` | Optionnel | Chemin hôte disponible du transcript capturé.              |
| `usage`        | `Usage`               | Requis    | Compteurs d’usage rapportés ; aucune estimation monétaire. |
| `durationMs`   | `number`              | Requis    | Durée d’exécution écoulée en millisecondes.                |

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
