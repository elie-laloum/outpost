---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Rôle et comportement

Crée un provider distant Daytona avec réglages distincts de connexion SDK et de création de sandbox. Les transferts utilisent l’environnement distant acquis et la synchronisation valide les modifications hôtes concurrentes avant application.

[Exemple complet et règles détaillées](../../guide/environment/providers/overview/).

## Paramètres et propriétés

| Nom                  | Type                                                                                      | Présence  | Rôle                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optionnel | Réglages de connexion Daytona, création de sandbox, racine du workspace, environnement et conservation des sorties. |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optionnel | Réglages de connexion du client SDK Daytona, distincts des options de création de sandbox.                          |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optionnel | Options de création de sandbox transmises au SDK du provider.                                                       |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                             |
| `options.root`       | `string \| undefined`                                                                     | Optionnel | Chemin du workspace de dépôt à l’intérieur de l’environnement d’exécution.                                          |
| `options.retain`     | `number \| undefined`                                                                     | Optionnel | Taille maximale de la fin conservée par flux, en octets.                                                            |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optionnel | Fabrique injectée renvoyant un client Daytona avec méthodes create/delete pour le cycle de vie des sandboxes.       |

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
