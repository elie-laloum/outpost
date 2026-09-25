---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxContext**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom              | Type                               | Présence  | Rôle                                                                             |
| ---------------- | ---------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `repository`     | `string`                           | Requis    | Checkout Git hôte ciblé.                                                         |
| `directory`      | `string`                           | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `gitDirectories` | `readonly string[]`                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `variables`      | `Readonly<Record<string, string>>` | Requis    | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `signal`         | `AbortSignal \| undefined`         | Optionnel | Annulation coopérative de cette opération.                                       |

## Signature

```ts
export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [Variables](../variables/)
