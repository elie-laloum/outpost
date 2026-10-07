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

Crée un provider distant sur Daytona ; le SDK optionnel @daytona/sdk se charge à l’acquisition. Chaque acquire crée une sandbox et confirme la politique egress éventuelle avant de préparer le workspace. Le checkout est privé ; repositoryMode accepte uniquement isolated, également le mode par défaut. release, ou une préparation en échec, supprime la sandbox. Avec caches, l’acquisition restaure les archives de téléchargements et release les sauvegarde via les transports côté hôte avant destruction ; une erreur de cache tente quand même la destruction.

[Exemple complet et règles détaillées](../../guide/cloud-sandboxes/).

## Paramètres et propriétés

| Nom                      | Type                                                                                      | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                | `DaytonaOptions \| undefined`                                                             | Optionnel | Réglages de connexion du client Daytona, de création de sandbox, d’egress, de racine du workspace, d’environnement et de conservation des sorties.                                                                                                                                                                                                                                            |
| `options.caches`         | `readonly CloudDependencyCache[] \| undefined`                                            | Optionnel | Caches de téléchargements optionnels sous /outpost/cache/&lt;name>, restaurés à l’acquisition et sauvegardés avant suppression via le transport obligatoire de chaque cache. L’identité inclut le dépôt hôte canonique, l’image/snapshot Daytona, les UID/GID, le nom et la clé. Les images non root doivent permettre la préparation privilégiée des répertoires de cache.                   |
| `options.repositoryMode` | `"isolated" \| undefined`                                                                 | Optionnel | isolated (mode par défaut et seul mode pris en charge) conserve le checkout et le répertoire Git dans le sandbox cloud. L’historique et les entrées sélectionnées sont envoyés ; les commits et modifications validés sont synchronisés sans importer la configuration, les hooks ou les refs sans rapport du sandbox. Les autres modes échouent avec le code configuration avant allocation. |
| `options.egress`         | `EgressPolicy \| undefined`                                                               | Optionnel | Politique portable appliquée par Daytona : deny-all, jusqu’à 100 domaines ou jusqu’à 10 allowCidrs IPv4, pas les deux, et aucun denyCidrs. Outpost la confirme avant de préparer le workspace ; un refus échoue avec le code provider et supprime la sandbox (il faut un compte Tier 3 ou 4 avec WRITE_SANDBOXES).                                                                            |
| `options.connection`     | `DaytonaConfig \| undefined`                                                              | Optionnel | Réglages passés au constructeur du client Daytona, comme la clé et l’URL d’API.                                                                                                                                                                                                                                                                                                               |
| `options.create`         | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined`            | Optionnel | Paramètres de création passés au SDK, depuis une image ou un snapshot. Ses champs réseau sont incompatibles avec egress et gardent sinon la sémantique Daytona, sans confirmation d’Outpost ; le code que l’image lance d’elle-même peut s’exécuter avant la fin de l’acquisition.                                                                                                            |
| `options.variables`      | `Readonly<Record<string, string>> \| undefined`                                           | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                                                                                                                           |
| `options.root`           | `string \| undefined`                                                                     | Optionnel | Répertoire du dépôt dans la sandbox, &lt;home>/outpost par défaut.                                                                                                                                                                                                                                                                                                                            |
| `options.retain`         | `number \| undefined`                                                                     | Optionnel | Octets de fin de sortie conservés par flux, 65536 par défaut.                                                                                                                                                                                                                                                                                                                                 |
| `connect`                | `((config?: DaytonaConfig) => Promise<Pick<Daytona, "create" \| "delete">>) \| undefined` | Optionnel | Renvoie le client dont create() et delete() gèrent les sandboxes, new Daytona(connection) de @daytona/sdk par défaut.                                                                                                                                                                                                                                                                         |

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
