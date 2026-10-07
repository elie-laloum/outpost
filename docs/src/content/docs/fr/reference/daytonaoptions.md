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

| Nom              | Type                                                                           | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caches`         | `readonly CloudDependencyCache[] \| undefined`                                 | Optionnel | Caches de téléchargements optionnels sous /outpost/cache/&lt;name>, restaurés à l’acquisition et sauvegardés avant suppression via le transport obligatoire de chaque cache. L’identité inclut le dépôt hôte canonique, l’image/snapshot Daytona, les UID/GID, le nom et la clé. Les images non root doivent permettre la préparation privilégiée des répertoires de cache.                   |
| `repositoryMode` | `"isolated" \| undefined`                                                      | Optionnel | isolated (mode par défaut et seul mode pris en charge) conserve le checkout et le répertoire Git dans le sandbox cloud. L’historique et les entrées sélectionnées sont envoyés ; les commits et modifications validés sont synchronisés sans importer la configuration, les hooks ou les refs sans rapport du sandbox. Les autres modes échouent avec le code configuration avant allocation. |
| `egress`         | `EgressPolicy \| undefined`                                                    | Optionnel | Politique portable appliquée par Daytona : deny-all, jusqu’à 100 domaines ou jusqu’à 10 allowCidrs IPv4, pas les deux, et aucun denyCidrs. Outpost la confirme avant de préparer le workspace ; un refus échoue avec le code provider et supprime la sandbox (il faut un compte Tier 3 ou 4 avec WRITE_SANDBOXES).                                                                            |
| `connection`     | `DaytonaConfig \| undefined`                                                   | Optionnel | Réglages passés au constructeur du client Daytona, comme la clé et l’URL d’API.                                                                                                                                                                                                                                                                                                               |
| `create`         | `CreateSandboxFromImageParams \| CreateSandboxFromSnapshotParams \| undefined` | Optionnel | Paramètres de création passés au SDK, depuis une image ou un snapshot. Ses champs réseau sont incompatibles avec egress et gardent sinon la sémantique Daytona, sans confirmation d’Outpost ; le code que l’image lance d’elle-même peut s’exécuter avant la fin de l’acquisition.                                                                                                            |
| `variables`      | `Readonly<Record<string, string>> \| undefined`                                | Optionnel | Variables d’environnement définies pour chaque commande de la sandbox, en valeurs littérales. Une clé aussi déclarée par l’agent échoue avec le code configuration.                                                                                                                                                                                                                           |
| `root`           | `string \| undefined`                                                          | Optionnel | Répertoire du dépôt dans la sandbox, &lt;home>/outpost par défaut.                                                                                                                                                                                                                                                                                                                            |
| `retain`         | `number \| undefined`                                                          | Optionnel | Octets de fin de sortie conservés par flux, 65536 par défaut.                                                                                                                                                                                                                                                                                                                                 |

## Signature

```ts
import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
} from "@daytona/sdk";

export interface DaytonaOptions {
  readonly caches?: readonly CloudDependencyCache[];
  readonly repositoryMode?: "isolated";
  readonly egress?: EgressPolicy;
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Contrats associés

- [CloudDependencyCache](../clouddependencycache/)
- [EgressPolicy](../egresspolicy/)
- [Variables](../variables/)
