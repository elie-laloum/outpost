---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **DaytonaOptions**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom          | Type                                                                           | Présence  | Rôle                                                                             |
| ------------ | ------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.          |
| `root`       | `string \| undefined`                                                          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `retain`     | `number \| undefined`                                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                         |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Contrats associés

- [Variables](../variables/)
