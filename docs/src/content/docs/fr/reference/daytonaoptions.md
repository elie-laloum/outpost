---
title: "DaytonaOptions"
description: "DaytonaOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DaytonaOptions } from "@elie-laloum/outpost/providers/daytona";
```

## Paramètres et propriétés

| Nom          | Type                                                                           | Présence  | Rôle                                                                                       |
| ------------ | ------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------ |
| `connection` | `DaytonaConfig \| undefined`                                                   | Optionnel | Réglages de connexion du client SDK Daytona, distincts des options de création de sandbox. |
| `create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optionnel | Options de création de sandbox transmises au SDK du provider.                              |
| `variables`  | `Readonly<Record<string, string>> \| undefined`                                | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                    |
| `root`       | `string \| undefined`                                                          | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                 |
| `retain`     | `number \| undefined`                                                          | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                   |

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
