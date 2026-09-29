---
title: "createDaytonaSandboxProvider"
description: "createDaytonaSandboxProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
```

## Rôle et comportement

Crée un provider distant sur Daytona ; le SDK optionnel @daytona/sdk se charge à l’acquisition. Chaque acquire crée une sandbox et confirme la politique egress éventuelle avant de préparer le workspace. release, ou une préparation en échec, supprime la sandbox.

[Exemple complet et règles détaillées](../../guide/cloud-sandboxes/).

## Paramètres et propriétés

| Nom                  | Type                                                                                      | Présence  | Rôle                                                                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`            | `DaytonaOptions \| undefined`                                                             | Optionnel | Réglages de connexion du client Daytona, de création de sandbox, d’egress, de racine du workspace, d’environnement et de conservation des sorties.                                                                                                                                                                 |
| `options.egress`     | `EgressPolicy \| undefined`                                                               | Optionnel | Politique portable appliquée par Daytona : deny-all, jusqu’à 100 domaines ou jusqu’à 10 allowCidrs IPv4, pas les deux, et aucun denyCidrs. Outpost la confirme avant de préparer le workspace ; un refus échoue avec le code provider et supprime la sandbox (il faut un compte Tier 3 ou 4 avec WRITE_SANDBOXES). |
| `options.connection` | `DaytonaConfig \| undefined`                                                              | Optionnel | Réglages passés au constructeur du client Daytona, comme la clé et l’URL d’API.                                                                                                                                                                                                                                    |
| `options.create`     | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optionnel | Paramètres de création passés au SDK, depuis une image ou un snapshot. Ses champs réseau sont incompatibles avec egress et gardent sinon la sémantique Daytona, sans confirmation d’Outpost ; le code que l’image lance d’elle-même peut s’exécuter avant la fin de l’acquisition.                                 |
| `options.variables`  | `Readonly<Record<string, string>> \| undefined`                                           | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                                                |
| `options.root`       | `string \| undefined`                                                                     | Optionnel | Répertoire du dépôt dans la sandbox, &lt;home>/outpost par défaut.                                                                                                                                                                                                                                                 |
| `options.retain`     | `number \| undefined`                                                                     | Optionnel | Octets de fin de sortie conservés par flux, 65536 par défaut.                                                                                                                                                                                                                                                      |
| `connect`            | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optionnel | Renvoie le client dont create() et delete() gèrent les sandboxes, new Daytona(connection) de @daytona/sdk par défaut.                                                                                                                                                                                              |

## Retour

`SandboxProvider`

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function createDaytonaSandboxProvider(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Contrats associés

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
