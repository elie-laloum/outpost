---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 10
---

Contrat public de **daytona**. Consultez le [guide providers](../../guide/environment/providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Rôle et comportement

Allouer conteneurs locaux, exécution hôte explicite ou sandboxes distantes via les sous-chemins du package.

Les providers montés et hôtes utilisent current par défaut ; les distants utilisent integrate et rejettent current. Les SDK optionnels restent optionnels. L’exécution locale ne fournit aucune isolation.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                  | Type                                                                                      | Présence  | Rôle                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                       |
| `options.root`       | `string \| undefined`                                                                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.retain`     | `number \| undefined`                                                                     | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                      |

## Retour

`SandboxProvider`

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function daytona(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Contrats associés

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
